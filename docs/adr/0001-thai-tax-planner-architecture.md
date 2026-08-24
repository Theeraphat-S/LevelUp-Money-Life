# 1. Thai Personal Income Tax Planner Architecture & Integration

**Context & Decision**: 
LevelUp Money Life requires a Thai Personal Income Tax (ภ.ง.ด. 90/91) calculation and planning engine. We decided to build this as a dedicated first-class tab (`Tax Planner`) integrated with the existing `TransactionLedger` (to auto-aggregate annual income and withholding taxes) while allowing manual overrides. The engine models 40(1) salary and 40(2) freelance income, comprehensive standard statutory expenses, and multi-category tax allowances with statutory retirement caps (500,000 THB across RMF/SSF/PVD/ThaiESG/Annuity).

**Consequences**:
- **Benefits**: Seamless integration with user cash flow data, live tax bracket simulation, proactive tax-saving recommendations (Tax Optimization Advisor), and alignment with the app's gamification system.
- **Constraints**: Focuses on individual earners (40(1) & 40(2)); specialized business income 40(3)-40(8) with complex itemized expense bookkeeping is deferred to future extensions.
