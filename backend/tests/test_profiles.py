def _signup(client, capture_tokens, email):
    client.post("/api/auth/signup", json={"email": email})
    raw = capture_tokens[email]
    r = client.post("/api/auth/magic-link/consume", json={"token": raw})
    return r.json()["access_token"]


def _create_profile(client, token, **overrides):
    payload = {
        "founder_name": "Ada Lovelace",
        "startup_name": "Analytical Engine",
        "tagline": "Computation for the curious.",
        "website": "https://analytical.test",
        "country": "GB",
        "cohort_year": 2022,
        "industry": "AI/ML",
        "linkedin_url": "https://linkedin.test/in/ada",
        "twitter_url": "https://x.com/ada",
        "contact_email": "ada@analytical.test",
        "contact_phone": "+44-7700-900000",
    }
    payload.update(overrides)
    r = client.patch("/api/profiles/me", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, r.text
    return r.json()


def test_profile_create_and_get_me(client, capture_tokens):
    token = _signup(client, capture_tokens, "a@example.com")
    me = _create_profile(client, token)
    assert me["startup_name"] == "Analytical Engine"
    assert me["country_name"] == "United Kingdom"
    assert me["is_hidden"] is False


def test_visibility_gate_hides_contact_when_anonymous(client, capture_tokens):
    token = _signup(client, capture_tokens, "b@example.com")
    _create_profile(client, token)

    # Anonymous list
    r = client.get("/api/profiles")
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) == 1
    assert items[0]["contact_email"] is None
    assert items[0]["contact_phone"] is None

    # Authenticated list
    r = client.get("/api/profiles", headers={"Authorization": f"Bearer {token}"})
    items = r.json()["items"]
    assert items[0]["contact_email"] == "ada@analytical.test"
    assert items[0]["contact_phone"] == "+44-7700-900000"


def test_invalid_country_rejected(client, capture_tokens):
    token = _signup(client, capture_tokens, "c@example.com")
    r = client.patch(
        "/api/profiles/me",
        json={"country": "ZZ"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 422


def test_invalid_industry_rejected(client, capture_tokens):
    token = _signup(client, capture_tokens, "d@example.com")
    r = client.patch(
        "/api/profiles/me",
        json={"industry": "Nonsense"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 422


def test_profile_detail_404_when_hidden_for_non_admin(client, capture_tokens):
    token = _signup(client, capture_tokens, "e@example.com")
    me = _create_profile(client, token)
    # Owner can fetch /profiles/me even if hidden, but admin hide makes /profiles/{id} 404
    admin = _signup(client, capture_tokens, "admin@example.com")
    r = client.post(
        f"/api/admin/profiles/{me['id']}/hide",
        headers={"Authorization": f"Bearer {admin}"},
    )
    assert r.status_code == 204
    # Anonymous fetch → 404
    r = client.get(f"/api/profiles/{me['id']}")
    assert r.status_code == 404
    # Admin can still see
    r = client.get(f"/api/profiles/{me['id']}", headers={"Authorization": f"Bearer {admin}"})
    assert r.status_code == 200


def test_admin_required(client, capture_tokens):
    token = _signup(client, capture_tokens, "regular@example.com")
    r = client.get("/api/admin/profiles", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


def test_password_too_short(client, capture_tokens):
    token = _signup(client, capture_tokens, "shortpw@example.com")
    r = client.post(
        "/api/auth/password",
        json={"password": "abc"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 422


def test_me_profile_complete_flag(client, capture_tokens):
    token = _signup(client, capture_tokens, "complete@example.com")
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    assert me["profile_complete"] is False
    _create_profile(client, token)
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    assert me["profile_complete"] is True
