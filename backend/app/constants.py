from datetime import date

INDUSTRIES = [
    "Fintech",
    "Healthtech",
    "AI/ML",
    "Climate",
    "Edtech",
    "Commerce",
    "Mobility",
    "Productivity",
    "Media",
    "Other",
]


def cohort_year_range() -> list[int]:
    return list(range(2016, date.today().year + 1))


# ISO 3166-1 alpha-2 (subset of commonly-represented countries; extend as needed)
COUNTRIES: dict[str, str] = {
    "NG": "Nigeria",
    "KE": "Kenya",
    "ZA": "South Africa",
    "GH": "Ghana",
    "EG": "Egypt",
    "UG": "Uganda",
    "TZ": "Tanzania",
    "RW": "Rwanda",
    "SN": "Senegal",
    "CI": "Côte d'Ivoire",
    "MA": "Morocco",
    "ET": "Ethiopia",
    "CM": "Cameroon",
    "ZM": "Zambia",
    "ZW": "Zimbabwe",
    "BJ": "Benin",
    "TG": "Togo",
    "US": "United States",
    "CA": "Canada",
    "MX": "Mexico",
    "BR": "Brazil",
    "AR": "Argentina",
    "CO": "Colombia",
    "CL": "Chile",
    "PE": "Peru",
    "GB": "United Kingdom",
    "IE": "Ireland",
    "FR": "France",
    "DE": "Germany",
    "ES": "Spain",
    "IT": "Italy",
    "NL": "Netherlands",
    "PT": "Portugal",
    "PL": "Poland",
    "SE": "Sweden",
    "FI": "Finland",
    "NO": "Norway",
    "DK": "Denmark",
    "CH": "Switzerland",
    "BE": "Belgium",
    "AT": "Austria",
    "IL": "Israel",
    "TR": "Turkey",
    "AE": "United Arab Emirates",
    "SA": "Saudi Arabia",
    "IN": "India",
    "PK": "Pakistan",
    "BD": "Bangladesh",
    "ID": "Indonesia",
    "PH": "Philippines",
    "VN": "Vietnam",
    "TH": "Thailand",
    "MY": "Malaysia",
    "SG": "Singapore",
    "JP": "Japan",
    "KR": "South Korea",
    "CN": "China",
    "TW": "Taiwan",
    "HK": "Hong Kong",
    "AU": "Australia",
    "NZ": "New Zealand",
}


def country_name(code: str) -> str:
    return COUNTRIES.get(code.upper(), code.upper())
