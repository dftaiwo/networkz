import pytest

from app.routers import stats as stats_router


@pytest.fixture(autouse=True)
def _clear_stats_cache():
    stats_router.invalidate_stats_cache()
    yield
    stats_router.invalidate_stats_cache()


def _signup(client, capture_tokens, email):
    client.post("/api/auth/signup", json={"email": email})
    raw = capture_tokens[email]
    return client.post("/api/auth/magic-link/consume", json={"token": raw}).json()["access_token"]


def _set_profile(client, token, **fields):
    base = {
        "founder_name": "Founder",
        "startup_name": "Test Co",
        "tagline": "",
        "country": "NG",
        "cohort_year": 2022,
        "industry": "Fintech",
    }
    base.update(fields)
    r = client.patch("/api/profiles/me", json=base, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, r.text


def _seed(client, capture_tokens):
    t1 = _signup(client, capture_tokens, "pay@example.com")
    _set_profile(
        client, t1,
        founder_name="Ada Pay", startup_name="PayWave", tagline="Mobile payments for Africa",
        country="NG", cohort_year=2022, industry="Fintech",
    )
    t2 = _signup(client, capture_tokens, "med@example.com")
    _set_profile(
        client, t2,
        founder_name="Bola Med", startup_name="MedDash", tagline="Telemedicine at scale",
        country="KE", cohort_year=2023, industry="Healthtech",
    )
    t3 = _signup(client, capture_tokens, "ai@example.com")
    _set_profile(
        client, t3,
        founder_name="Chi Lin", startup_name="VectorAI", tagline="ML infrastructure",
        country="NG", cohort_year=2024, industry="AI/ML",
    )


def test_filter_by_country(client, capture_tokens):
    _seed(client, capture_tokens)
    items = client.get("/api/profiles?country=NG").json()["items"]
    assert {p["startup_name"] for p in items} == {"PayWave", "VectorAI"}


def test_filter_by_year(client, capture_tokens):
    _seed(client, capture_tokens)
    items = client.get("/api/profiles?year=2023").json()["items"]
    assert [p["startup_name"] for p in items] == ["MedDash"]


def test_filter_by_industry(client, capture_tokens):
    _seed(client, capture_tokens)
    items = client.get("/api/profiles?industry=Fintech").json()["items"]
    assert [p["startup_name"] for p in items] == ["PayWave"]


def test_combined_filters(client, capture_tokens):
    _seed(client, capture_tokens)
    items = client.get("/api/profiles?country=NG&year=2022&industry=Fintech&q=pay").json()["items"]
    assert [p["startup_name"] for p in items] == ["PayWave"]


def test_freetext_q_searches_tagline_and_name(client, capture_tokens):
    _seed(client, capture_tokens)
    items = client.get("/api/profiles?q=telemedicine").json()["items"]
    assert [p["startup_name"] for p in items] == ["MedDash"]
    items = client.get("/api/profiles?q=vector").json()["items"]
    assert [p["startup_name"] for p in items] == ["VectorAI"]


def test_stats_reflect_data(client, capture_tokens):
    _seed(client, capture_tokens)
    stats_router.invalidate_stats_cache()
    s = client.get("/api/stats").json()
    assert s["total_alumni"] == 3
    assert s["countries"] == 2
    assert s["cohort_years"] == 3
    assert s["industries"] == 3


def test_pagination_metadata(client, capture_tokens):
    _seed(client, capture_tokens)
    body = client.get("/api/profiles?page_size=2&page=1").json()
    assert body["total"] == 3
    assert len(body["items"]) == 2
    assert body["page"] == 1
    body = client.get("/api/profiles?page_size=2&page=2").json()
    assert len(body["items"]) == 1
