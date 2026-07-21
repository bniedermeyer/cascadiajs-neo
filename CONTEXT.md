# CascadiaJS

The annual Pacific Northwest JavaScript conference website. This site serves as the public home for all past and current editions of the conference.

## Language

**Event**:
One annual instance of the CascadiaJS conference (e.g., CascadiaJS 2024), identified by a slug like `cascadiajs-2024`.
_Avoid_: Edition, Year, Conference (when referring to a specific annual instance)

**Event Key**:
The short identifier used to associate data with an Event in local datasets — a bare year (`2026`, `2025`) or the catch-all bucket `previous` for pre-2025 sponsors. Distinct from the Event slug (`cascadiajs-2024`). Sponsors record their Event membership as an `events` array of Event Keys.
_Avoid_: Year (as a field or prop name — prefer Event / Event Key)

**Talk**:
A presentation delivered by a Speaker at an Event.
_Avoid_: Session, Presentation

**Speaker**:
A person who delivers a Talk at an Event.
_Avoid_: Presenter

**Sponsor**:
A company or organization that financially supports an Event.
_Avoid_: Partner
