"""
Enterprise AI Risk Calculator Core Module

Author: Oleh Ivchenko
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Optional
import json


class RiskCategory(Enum):
    """Risk categories across AI lifecycle stages"""
    # Design Phase
    DATA_POISONING = "data_poisoning"
    TRAINING_BIAS = "training_bias"
    SCOPE_CREEP = "scope_creep"
    MODEL_MISMATCH = "model_mismatch"
    ANNOTATION_QUALITY = "annotation_quality"
    
    # Deployment Phase
    SCALABILITY = "scalability"
    SECURITY = "security"
    VENDOR_LOCKIN = "vendor_lockin"
    INTEGRATION = "integration"
    COMPLIANCE = "compliance"
    
    # Inference Phase
    DATA_DRIFT = "data_drift"
    HALLUCINATION = "hallucination"
    COST_OVERRUN = "cost_overrun"
    LATENCY = "latency"
    FEEDBACK_CORRUPTION = "feedback_corruption"


class AISystemType(Enum):
    """Type of AI system being assessed"""
    NARROW_TASK = "narrow_task"  # Single-purpose ML model
    GENERAL_PURPOSE = "general_purpose"  # LLM/Foundation model
    HYBRID = "hybrid"  # Combination


class ProjectPhase(Enum):
    """Current phase of the AI project"""
    CONCEPT = "concept"
    DESIGN = "design"
    DEVELOPMENT = "development"
    DEPLOYMENT = "deployment"
    PRODUCTION = "production"


@dataclass
class RiskFactor:
    """Individual risk factor with scoring"""
    category: RiskCategory
    name: str
    description: str
    base_score: float  # 0-10
    phase: str  # design, deployment, inference
    narrow_multiplier: float = 1.0
    general_multiplier: float = 1.0
    
    def get_score(self, system_type: AISystemType) -> float:
        """Calculate risk score adjusted by system type"""
        if system_type == AISystemType.NARROW_TASK:
            return self.base_score * self.narrow_multiplier
        elif system_type == AISystemType.GENERAL_PURPOSE:
            return self.base_score * self.general_multiplier
        else:  # HYBRID
            return self.base_score * (self.narrow_multiplier + self.general_multiplier) / 2


@dataclass
class RiskProfile:
    """Complete risk profile for an AI project"""
    project_name: str
    system_type: AISystemType
    phase: ProjectPhase
    industry: str
    team_size: int
    budget_usd: float
    timeline_months: int
    
    # Risk assessments (0-10 scale)
    assessments: Dict[RiskCategory, int] = field(default_factory=dict)
    
    # Calculated scores
    design_score: float = 0.0
    deployment_score: float = 0.0
    inference_score: float = 0.0
    total_score: float = 0.0
    risk_level: str = "unknown"
    
    # Estimated costs
    estimated_risk_cost_usd: float = 0.0
    mitigation_cost_usd: float = 0.0


class RiskCalculator:
    """
    Enterprise AI Risk Calculator
    
    Assesses risks across design, deployment, and inference phases
    with cost-effective mitigation recommendations.
    """
    
    # Risk factors with base scores and multipliers
    RISK_FACTORS: List[RiskFactor] = [
        # Design Phase
        RiskFactor(RiskCategory.DATA_POISONING, "Data Poisoning", 
                   "Malicious or corrupted training data", 7.0, "design", 
                   narrow_multiplier=1.2, general_multiplier=0.8),
        RiskFactor(RiskCategory.TRAINING_BIAS, "Training Bias",
                   "Systematic bias in training data", 8.0, "design",
                   narrow_multiplier=1.0, general_multiplier=1.3),
        RiskFactor(RiskCategory.SCOPE_CREEP, "Scope Creep",
                   "Uncontrolled expansion of requirements", 6.0, "design",
                   narrow_multiplier=0.8, general_multiplier=1.5),
        RiskFactor(RiskCategory.MODEL_MISMATCH, "Model Mismatch",
                   "Wrong model architecture for the task", 7.5, "design",
                   narrow_multiplier=1.3, general_multiplier=0.7),
        RiskFactor(RiskCategory.ANNOTATION_QUALITY, "Annotation Quality",
                   "Poor quality labels and annotations", 6.5, "design",
                   narrow_multiplier=1.4, general_multiplier=0.6),
        
        # Deployment Phase
        RiskFactor(RiskCategory.SCALABILITY, "Scalability Issues",
                   "Inability to handle production load", 7.0, "deployment",
                   narrow_multiplier=0.9, general_multiplier=1.4),
        RiskFactor(RiskCategory.SECURITY, "Security Vulnerabilities",
                   "Adversarial attacks, model theft", 8.5, "deployment",
                   narrow_multiplier=0.8, general_multiplier=1.3),
        RiskFactor(RiskCategory.VENDOR_LOCKIN, "Vendor Lock-in",
                   "Dependency on specific providers", 5.5, "deployment",
                   narrow_multiplier=0.7, general_multiplier=1.6),
        RiskFactor(RiskCategory.INTEGRATION, "Integration Complexity",
                   "Difficulty integrating with existing systems", 6.0, "deployment",
                   narrow_multiplier=1.0, general_multiplier=1.2),
        RiskFactor(RiskCategory.COMPLIANCE, "Compliance Gaps",
                   "Regulatory and legal compliance issues", 7.5, "deployment",
                   narrow_multiplier=0.9, general_multiplier=1.4),
        
        # Inference Phase
        RiskFactor(RiskCategory.DATA_DRIFT, "Data/Concept Drift",
                   "Model degradation over time", 8.0, "inference",
                   narrow_multiplier=1.3, general_multiplier=0.9),
        RiskFactor(RiskCategory.HALLUCINATION, "Hallucination",
                   "Model generating false information", 9.0, "inference",
                   narrow_multiplier=0.4, general_multiplier=1.8),
        RiskFactor(RiskCategory.COST_OVERRUN, "Cost Overruns",
                   "Unexpected compute/API costs", 6.5, "inference",
                   narrow_multiplier=0.6, general_multiplier=1.5),
        RiskFactor(RiskCategory.LATENCY, "Latency Degradation",
                   "Unacceptable response times", 5.5, "inference",
                   narrow_multiplier=0.8, general_multiplier=1.3),
        RiskFactor(RiskCategory.FEEDBACK_CORRUPTION, "Feedback Loop Corruption",
                   "Degradation from corrupted user feedback", 7.0, "inference",
                   narrow_multiplier=1.1, general_multiplier=1.2),
    ]
    
    # Cost multipliers by industry
    INDUSTRY_COST_MULTIPLIERS = {
        "healthcare": 1.5,
        "finance": 1.4,
        "government": 1.3,
        "retail": 1.0,
        "manufacturing": 1.1,
        "technology": 0.9,
        "other": 1.0
    }
    
    def __init__(self):
        self.risk_factor_map = {rf.category: rf for rf in self.RISK_FACTORS}
    
    def calculate(self, profile: RiskProfile) -> RiskProfile:
        """
        Calculate comprehensive risk score for the profile
        
        Returns updated RiskProfile with scores and estimates
        """
        design_risks = []
        deployment_risks = []
        inference_risks = []
        
        for category, assessment in profile.assessments.items():
            risk_factor = self.risk_factor_map.get(category)
            if not risk_factor:
                continue
                
            # Combine user assessment with system-type-adjusted base score
            adjusted_score = (
                assessment * 0.6 +  # User assessment weight
                risk_factor.get_score(profile.system_type) * 0.4  # Base weight
            )
            
            if risk_factor.phase == "design":
                design_risks.append(adjusted_score)
            elif risk_factor.phase == "deployment":
                deployment_risks.append(adjusted_score)
            else:
                inference_risks.append(adjusted_score)
        
        # Calculate phase scores (average of risks in each phase)
        profile.design_score = sum(design_risks) / len(design_risks) if design_risks else 0
        profile.deployment_score = sum(deployment_risks) / len(deployment_risks) if deployment_risks else 0
        profile.inference_score = sum(inference_risks) / len(inference_risks) if inference_risks else 0
        
        # Weight by current phase
        phase_weights = {
            ProjectPhase.CONCEPT: (0.5, 0.3, 0.2),
            ProjectPhase.DESIGN: (0.4, 0.35, 0.25),
            ProjectPhase.DEVELOPMENT: (0.3, 0.4, 0.3),
            ProjectPhase.DEPLOYMENT: (0.2, 0.4, 0.4),
            ProjectPhase.PRODUCTION: (0.15, 0.25, 0.6),
        }
        
        weights = phase_weights.get(profile.phase, (0.33, 0.33, 0.34))
        profile.total_score = (
            profile.design_score * weights[0] +
            profile.deployment_score * weights[1] +
            profile.inference_score * weights[2]
        )
        
        # Determine risk level
        if profile.total_score < 3:
            profile.risk_level = "low"
        elif profile.total_score < 5:
            profile.risk_level = "moderate"
        elif profile.total_score < 7:
            profile.risk_level = "high"
        else:
            profile.risk_level = "critical"
        
        # Estimate costs
        industry_mult = self.INDUSTRY_COST_MULTIPLIERS.get(
            profile.industry.lower(), 1.0
        )
        
        # Risk cost = base percentage of budget * risk score * industry multiplier
        risk_percentage = profile.total_score / 10 * 0.4  # Up to 40% of budget at max risk
        profile.estimated_risk_cost_usd = profile.budget_usd * risk_percentage * industry_mult
        
        # Mitigation cost = typically 10-20% of risk cost
        profile.mitigation_cost_usd = profile.estimated_risk_cost_usd * 0.15
        
        return profile
    
    def get_top_risks(self, profile: RiskProfile, n: int = 5) -> List[Dict]:
        """Get the top N risks for a profile"""
        risks = []
        for category, assessment in profile.assessments.items():
            risk_factor = self.risk_factor_map.get(category)
            if risk_factor:
                score = (
                    assessment * 0.6 +
                    risk_factor.get_score(profile.system_type) * 0.4
                )
                risks.append({
                    "category": category.value,
                    "name": risk_factor.name,
                    "description": risk_factor.description,
                    "score": round(score, 2),
                    "phase": risk_factor.phase
                })
        
        return sorted(risks, key=lambda x: x["score"], reverse=True)[:n]
    
    def to_dict(self, profile: RiskProfile) -> Dict:
        """Convert profile to dictionary for API response"""
        return {
            "project_name": profile.project_name,
            "system_type": profile.system_type.value,
            "phase": profile.phase.value,
            "industry": profile.industry,
            "scores": {
                "design": round(profile.design_score, 2),
                "deployment": round(profile.deployment_score, 2),
                "inference": round(profile.inference_score, 2),
                "total": round(profile.total_score, 2)
            },
            "risk_level": profile.risk_level,
            "estimated_costs": {
                "risk_cost_usd": round(profile.estimated_risk_cost_usd, 2),
                "mitigation_cost_usd": round(profile.mitigation_cost_usd, 2),
                "potential_savings_usd": round(
                    profile.estimated_risk_cost_usd - profile.mitigation_cost_usd, 2
                )
            },
            "top_risks": self.get_top_risks(profile)
        }
