# Hero Demo Acceptance

## Seed

- Synthetic Mehra family, two adults and two children, based in Gurgaon.
- Return route: Paris to Dubai to Delhi.
- Paris to Dubai delay makes Dubai connection impossible.
- Policy keeps family together, forbids self-transfer, permits one stop, requires premium economy, approved transit, 90-minute connection, Sunday 8 PM Delhi arrival, and INR 75,000 automatic spend ceiling.

## Script

1. Open premium-card SafarSet entry screen.
2. Review synthetic family and pre-approved recovery policy.
3. Open active trip.
4. Inject fixture-backed delay.
5. Show missed-connection calculation.
6. Show every candidate and hard-rule result.
7. Show unsafe alternatives rejected with exact reasons.
8. Show ranked valid route and weighted score.
9. Show automatic action allowed inside spend policy.
10. Show `SIMULATED_REISSUE`, hotel, transfer, and notification results.
11. Show complete audit trail.
12. Open API Truth Table and evaluation dashboard.

## Pass Conditions

- Family never splits.
- No rejected candidate is selected.
- Selected route has explainable score and every hard check passes.
- No action repeats when disruption is injected again.
- Every fixture-backed or simulated result is labelled in primary UI.
- Flow works with all API keys absent.
