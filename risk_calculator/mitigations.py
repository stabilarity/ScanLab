"""
Mitigation Recommendations Engine

Author: Oleh Ivchenko
"""

from dataclasses import dataclass
from typing import List, Dict
from enum import Enum
from .calculator import RiskCategory, AISystemType


class MitigationCost(Enum):
    """Cost level for mitigations"""
    LOW = "low"  # < $10K or minimal effort
    MEDIUM = "medium"  # $10K - $100K
    HIGH = "high"  # > $100K


class MitigationEffort(Enum):
    """Implementation effort"""
    QUICK_WIN = "quick_win"  # Days
    SHORT_TERM = "short_term"  # Weeks
    LONG_TERM = "long_term"  # Months


@dataclass
class Mitigation:
    """A specific mitigation recommendation"""
    id: str
    name: str
    description: str
    risk_categories: List[RiskCategory]
    cost: MitigationCost
    effort: MitigationEffort
    effectiveness: float  # 0-1, how much it reduces risk
    applicable_to: List[AISystemType]
    implementation_steps: List[str]
    tools_and_resources: List[str]


class MitigationEngine:
    """
    Recommends cost-effective mitigations based on risk profile
    """
    
    MITIGATIONS: List[Mitigation] = [
        # Design Phase Mitigations
        Mitigation(
            id="m001",
            name="Data Validation Pipeline",
            description="Automated data quality checks before training",
            risk_categories=[RiskCategory.DATA_POISONING, RiskCategory.ANNOTATION_QUALITY],
            cost=MitigationCost.LOW,
            effort=MitigationEffort.SHORT_TERM,
            effectiveness=0.7,
            applicable_to=[AISystemType.NARROW_TASK, AISystemType.HYBRID],
            implementation_steps=[
                "Define data quality metrics (completeness, consistency, accuracy)",
                "Implement automated validation scripts",
                "Set up anomaly detection for training data",
                "Create data quarantine process for flagged samples"
            ],
            tools_and_resources=[
                "Great Expectations (Python)",
                "TensorFlow Data Validation",
                "Pandera"
            ]
        ),
        Mitigation(
            id="m002",
            name="Bias Audit Framework",
            description="Systematic bias detection and measurement",
            risk_categories=[RiskCategory.TRAINING_BIAS],
            cost=MitigationCost.MEDIUM,
            effort=MitigationEffort.SHORT_TERM,
            effectiveness=0.65,
            applicable_to=[AISystemType.NARROW_TASK, AISystemType.GENERAL_PURPOSE, AISystemType.HYBRID],
            implementation_steps=[
                "Define protected attributes and fairness metrics",
                "Implement bias measurement across subgroups",
                "Create bias dashboards for monitoring",
                "Establish bias thresholds and escalation procedures"
            ],
            tools_and_resources=[
                "Fairlearn (Microsoft)",
                "AI Fairness 360 (IBM)",
                "What-If Tool (Google)"
            ]
        ),
        Mitigation(
            id="m003",
            name="Requirements Freeze Protocol",
            description="Formal change management for AI requirements",
            risk_categories=[RiskCategory.SCOPE_CREEP],
            cost=MitigationCost.LOW,
            effort=MitigationEffort.QUICK_WIN,
            effectiveness=0.6,
            applicable_to=[AISystemType.NARROW_TASK, AISystemType.GENERAL_PURPOSE, AISystemType.HYBRID],
            implementation_steps=[
                "Document baseline requirements with acceptance criteria",
                "Establish change request process with impact analysis",
                "Define freeze points aligned with development phases",
                "Create scope variance reporting"
            ],
            tools_and_resources=[
                "JIRA/Linear for tracking",
                "Requirements traceability matrix",
                "Change impact calculator"
            ]
        ),
        
        # Deployment Phase Mitigations
        Mitigation(
            id="m004",
            name="Load Testing & Auto-Scaling",
            description="Comprehensive performance testing with elastic infrastructure",
            risk_categories=[RiskCategory.SCALABILITY, RiskCategory.LATENCY],
            cost=MitigationCost.MEDIUM,
            effort=MitigationEffort.SHORT_TERM,
            effectiveness=0.8,
            applicable_to=[AISystemType.NARROW_TASK, AISystemType.GENERAL_PURPOSE, AISystemType.HYBRID],
            implementation_steps=[
                "Define performance SLOs (latency, throughput)",
                "Implement load testing suite",
                "Configure auto-scaling policies",
                "Set up performance monitoring and alerting"
            ],
            tools_and_resources=[
                "Locust / k6 for load testing",
                "Kubernetes HPA",
                "AWS Auto Scaling / GCP Cloud Run"
            ]
        ),
        Mitigation(
            id="m005",
            name="Model Security Hardening",
            description="Protection against adversarial attacks and model theft",
            risk_categories=[RiskCategory.SECURITY],
            cost=MitigationCost.MEDIUM,
            effort=MitigationEffort.LONG_TERM,
            effectiveness=0.75,
            applicable_to=[AISystemType.NARROW_TASK, AISystemType.GENERAL_PURPOSE, AISystemType.HYBRID],
            implementation_steps=[
                "Implement input validation and sanitization",
                "Add adversarial example detection",
                "Encrypt model weights and secure API endpoints",
                "Implement rate limiting and anomaly detection"
            ],
            tools_and_resources=[
                "Adversarial Robustness Toolbox (IBM)",
                "CleverHans",
                "MLflow with encryption"
            ]
        ),
        Mitigation(
            id="m006",
            name="Multi-Cloud Abstraction Layer",
            description="Vendor-agnostic deployment architecture",
            risk_categories=[RiskCategory.VENDOR_LOCKIN],
            cost=MitigationCost.HIGH,
            effort=MitigationEffort.LONG_TERM,
            effectiveness=0.85,
            applicable_to=[AISystemType.NARROW_TASK, AISystemType.GENERAL_PURPOSE, AISystemType.HYBRID],
            implementation_steps=[
                "Define abstraction interfaces for ML ops",
                "Implement provider adapters",
                "Containerize all components",
                "Create deployment automation for multiple targets"
            ],
            tools_and_resources=[
                "Kubernetes / KubeFlow",
                "MLflow",
                "Terraform / Pulumi"
            ]
        ),
        
        # Inference Phase Mitigations
        Mitigation(
            id="m007",
            name="Drift Detection System",
            description="Continuous monitoring for data and concept drift",
            risk_categories=[RiskCategory.DATA_DRIFT],
            cost=MitigationCost.MEDIUM,
            effort=MitigationEffort.SHORT_TERM,
            effectiveness=0.75,
            applicable_to=[AISystemType.NARROW_TASK, AISystemType.HYBRID],
            implementation_steps=[
                "Establish baseline data distributions",
                "Implement statistical drift detection",
                "Set up automated retraining triggers",
                "Create drift dashboards"
            ],
            tools_and_resources=[
                "Evidently AI",
                "NannyML",
                "Alibi Detect"
            ]
        ),
        Mitigation(
            id="m008",
            name="Hallucination Guardrails",
            description="Output validation and grounding mechanisms",
            risk_categories=[RiskCategory.HALLUCINATION],
            cost=MitigationCost.MEDIUM,
            effort=MitigationEffort.SHORT_TERM,
            effectiveness=0.6,
            applicable_to=[AISystemType.GENERAL_PURPOSE, AISystemType.HYBRID],
            implementation_steps=[
                "Implement retrieval-augmented generation (RAG)",
                "Add fact-checking layers",
                "Create output validators",
                "Establish human review thresholds"
            ],
            tools_and_resources=[
                "LangChain / LlamaIndex",
                "Guardrails AI",
                "NeMo Guardrails (NVIDIA)"
            ]
        ),
        Mitigation(
            id="m009",
            name="Cost Monitoring & Budgeting",
            description="Real-time cost tracking with automated controls",
            risk_categories=[RiskCategory.COST_OVERRUN],
            cost=MitigationCost.LOW,
            effort=MitigationEffort.QUICK_WIN,
            effectiveness=0.8,
            applicable_to=[AISystemType.NARROW_TASK, AISystemType.GENERAL_PURPOSE, AISystemType.HYBRID],
            implementation_steps=[
                "Set up cost dashboards per service",
                "Implement usage alerts and thresholds",
                "Configure automatic scaling limits",
                "Create cost allocation reports"
            ],
            tools_and_resources=[
                "Cloud cost management (AWS Cost Explorer, GCP Billing)",
                "Infracost",
                "OpenCost"
            ]
        ),
        Mitigation(
            id="m010",
            name="Feedback Loop Monitoring",
            description="Detection and prevention of feedback corruption",
            risk_categories=[RiskCategory.FEEDBACK_CORRUPTION],
            cost=MitigationCost.MEDIUM,
            effort=MitigationEffort.SHORT_TERM,
            effectiveness=0.7,
            applicable_to=[AISystemType.NARROW_TASK, AISystemType.GENERAL_PURPOSE, AISystemType.HYBRID],
            implementation_steps=[
                "Implement feedback quality scoring",
                "Add anomaly detection on feedback patterns",
                "Create feedback quarantine process",
                "Establish feedback validation rules"
            ],
            tools_and_resources=[
                "Custom feedback analytics",
                "Label Studio for feedback review",
                "Statistical process control"
            ]
        ),
    ]
    
    def __init__(self):
        self.mitigation_map = {m.id: m for m in self.MITIGATIONS}
    
    def recommend(
        self,
        risk_categories: List[RiskCategory],
        system_type: AISystemType,
        max_cost: MitigationCost = MitigationCost.HIGH,
        max_count: int = 5
    ) -> List[Dict]:
        """
        Recommend mitigations based on risk profile
        
        Args:
            risk_categories: Categories with high risk scores
            system_type: Type of AI system
            max_cost: Maximum acceptable cost level
            max_count: Maximum recommendations to return
        
        Returns:
            List of mitigation recommendations sorted by effectiveness
        """
        cost_order = [MitigationCost.LOW, MitigationCost.MEDIUM, MitigationCost.HIGH]
        max_cost_idx = cost_order.index(max_cost)
        
        recommendations = []
        
        for mitigation in self.MITIGATIONS:
            # Check if applicable to system type
            if system_type not in mitigation.applicable_to:
                continue
            
            # Check if addresses any of the risk categories
            matching_risks = set(mitigation.risk_categories) & set(risk_categories)
            if not matching_risks:
                continue
            
            # Check cost constraint
            if cost_order.index(mitigation.cost) > max_cost_idx:
                continue
            
            recommendations.append({
                "id": mitigation.id,
                "name": mitigation.name,
                "description": mitigation.description,
                "addresses_risks": [r.value for r in matching_risks],
                "cost": mitigation.cost.value,
                "effort": mitigation.effort.value,
                "effectiveness": mitigation.effectiveness,
                "implementation_steps": mitigation.implementation_steps,
                "tools": mitigation.tools_and_resources
            })
        
        # Sort by effectiveness (descending) and cost (ascending)
        recommendations.sort(
            key=lambda x: (-x["effectiveness"], cost_order.index(MitigationCost(x["cost"])))
        )
        
        return recommendations[:max_count]
    
    def estimate_mitigation_impact(
        self,
        recommendations: List[Dict],
        current_risk_score: float,
        budget_usd: float
    ) -> Dict:
        """
        Estimate the impact of implementing recommended mitigations
        """
        total_effectiveness = 0
        for rec in recommendations:
            # Diminishing returns for multiple mitigations
            remaining_risk = 1 - total_effectiveness
            total_effectiveness += remaining_risk * rec["effectiveness"] * 0.5
        
        new_risk_score = current_risk_score * (1 - total_effectiveness)
        risk_reduction = current_risk_score - new_risk_score
        
        # Estimate cost savings
        risk_cost_reduction = (risk_reduction / 10) * 0.4 * budget_usd
        
        return {
            "current_risk_score": round(current_risk_score, 2),
            "projected_risk_score": round(new_risk_score, 2),
            "risk_reduction": round(risk_reduction, 2),
            "projected_savings_usd": round(risk_cost_reduction, 2),
            "effectiveness_percentage": round(total_effectiveness * 100, 1)
        }
