"""
Enterprise AI Risk Calculator
==============================

A cost-effective risk assessment tool for enterprise AI projects.

Author: Oleh Ivchenko
Affiliation: Capgemini Engineering / ONPU
"""

from .calculator import RiskCalculator, RiskProfile, RiskCategory
from .mitigations import MitigationEngine, Mitigation

__all__ = [
    'RiskCalculator',
    'RiskProfile', 
    'RiskCategory',
    'MitigationEngine',
    'Mitigation'
]

__version__ = '0.1.0'
__author__ = 'Oleh Ivchenko'
