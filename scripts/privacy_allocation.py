import csv
import math
import random
import os

random.seed(42)  # reproducible Laplace noise so demo numbers match the docs


def load_data(file_path):
    """Loads synthetic data from CSV."""
    records = []
    if not os.path.exists(file_path):
        print(f"Data file not found at {file_path}. Please run synthetic_gen.py first.")
        return []
    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Type casting
            row['family_size'] = int(row['family_size'])
            row['food_insecurity_score'] = float(row['food_insecurity_score'])
            row['shelter_damage_score'] = float(row['shelter_damage_score'])
            row['chronic_disease_present'] = int(row['chronic_disease_present'])
            row['vulnerability_index'] = float(row['vulnerability_index'])
            records.append(row)
    return records

# 1. Differential Privacy (Laplace Mechanism)
def laplace_noise(scale):
    """Generates noise from a Laplace distribution centered at 0 with given scale."""
    u = random.random() - 0.5
    # Sign of u * scale * ln(1 - 2*|u|)
    return -scale * math.copysign(1.0, u) * math.log(1.0 - 2.0 * abs(u))

def dp_sum(values, epsilon, sensitivity):
    """Computes an epsilon-differentially private sum of values."""
    if epsilon <= 0:
        raise ValueError("Epsilon must be greater than 0")
    actual_sum = sum(values)
    scale = sensitivity / epsilon
    noise = laplace_noise(scale)
    return actual_sum + noise, noise

# 2. k-Anonymity Verification & Suppression
def check_k_anonymity(records, quasi_identifiers, k):
    """
    Checks if the dataset satisfies k-anonymity for the given quasi-identifiers.
    Returns the equivalence classes and a list of records that violate k-anonymity.
    """
    groups = {}
    for r in records:
        # Create group key from quasi-identifiers
        key = tuple(r[qi] for qi in quasi_identifiers)
        if key not in groups:
            groups[key] = []
        groups[key].append(r)
        
    violating_records = []
    safe_records = []
    
    for key, group in groups.items():
        if len(group) < k:
            violating_records.extend(group)
        else:
            safe_records.extend(group)
            
    return groups, safe_records, violating_records

# 3. Fairness-Constrained Resource Allocation
def allocate_resources(camp_needs, total_resources, alpha=0.5):
    """
    Allocates resources across camps using a Utility-Fairness trade-off.
    camp_needs: dict of {camp_name: aggregated_need_score}
    total_resources: float, total amount of aid/resources to distribute
    alpha: fairness parameter (0 = Max Utility, 1 = Max Fairness/Equal share, 0.5 = Balanced)
    """
    camps = list(camp_needs.keys())
    needs = [camp_needs[c] for c in camps]
    total_need = sum(needs)
    
    if total_need == 0:
        return {c: total_resources / len(camps) for c in camps}
        
    allocations = {}
    
    # Utility Share: proportional to need
    utility_shares = [n / total_need for n in needs]
    
    # Equal Share: divide equally
    equal_shares = [1.0 / len(camps) for _ in camps]
    
    for i, camp in enumerate(camps):
        # Combined share
        share = (1 - alpha) * utility_shares[i] + alpha * equal_shares[i]
        allocations[camp] = round(share * total_resources, 2)
        
    return allocations

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "..", "data", "synthetic_refugee_data.csv")
    
    # Check if data exists; if not, generate it
    if not os.path.exists(data_path):
        print("Data not found. Running synthetic generator...")
        from synthetic_gen import generate_synthetic_data
        generate_synthetic_data(data_path, num_records=2000)
        
    records = load_data(data_path)
    if not records:
        return
        
    print(f"--- Loaded {len(records)} records for Privacy and Allocation Analysis ---")
    
    # --- Part 1: Differential Privacy Demo ---
    print("\n[DEMO 1] Differential Privacy (Laplace Mechanism) on Vulnerability Sum")
    # Sensitivity of vulnerability_index sum when adding/removing 1 household is max vulnerability = 1.0
    sensitivity = 1.0
    camps = ["Camp Alpha", "Camp Beta", "Camp Gamma"]
    
    for camp in camps:
        camp_vuln = [r['vulnerability_index'] for r in records if r['camp_name'] == camp]
        actual = sum(camp_vuln)
        
        # Test with high and low epsilon
        dp_high_eps, noise_high = dp_sum(camp_vuln, epsilon=1.0, sensitivity=sensitivity)
        dp_low_eps, noise_low = dp_sum(camp_vuln, epsilon=0.1, sensitivity=sensitivity)
        
        print(f"\n{camp}:")
        print(f"  Actual Vulnerability Sum: {actual:.2f}")
        print(f"  DP Sum (epsilon = 1.0, high privacy budget): {dp_high_eps:.2f} (noise: {noise_high:.2f})")
        print(f"  DP Sum (epsilon = 0.1, low privacy budget):  {dp_low_eps:.2f} (noise: {noise_low:.2f})")
        
    # --- Part 2: k-Anonymity Demo ---
    print("\n[DEMO 2] k-Anonymity Verification")
    quasi_identifiers = ["camp_name", "head_gender", "head_age_group"]
    k_val = 15
    groups, safe, violated = check_k_anonymity(records, quasi_identifiers, k=k_val)
    
    print(f"Checking k-anonymity for Quasi-Identifiers: {quasi_identifiers} with k = {k_val}")
    print(f"  Total Equivalence Groups: {len(groups)}")
    print(f"  Safe Records meeting k-anonymity: {len(safe)} ({len(safe)/len(records)*100:.1f}%)")
    print(f"  Violating Records (suppressed):   {len(violated)} ({len(violated)/len(records)*100:.1f}%)")
    
    if violated:
        print("  Sample suppressed group characteristics (violating k-anonymity):")
        unique_violators = set(tuple(r[qi] for qi in quasi_identifiers) for r in violated)
        for uv in list(unique_violators)[:3]:
            print(f"    Group: {dict(zip(quasi_identifiers, uv))} has count < {k_val}")

    # --- Part 3: Fairness-Constrained Allocation Demo ---
    print("\n[DEMO 3] Fairness-Constrained Resource Allocation")
    # Let's aggregate needs per camp (using DP sums for security!)
    camp_needs = {}
    total_resources = 1500  # e.g., healthcare kits
    
    for camp in camps:
        camp_vuln = [r['vulnerability_index'] for r in records if r['camp_name'] == camp]
        # Aggregate with DP (epsilon = 0.5) to ensure camp needs sharing doesn't leak individual info
        dp_val, _ = dp_sum(camp_vuln, epsilon=0.5, sensitivity=1.0)
        camp_needs[camp] = max(0.0, dp_val) # non-negative
        
    print(f"Aggregated Needs (Epsilon-DP aggregated):")
    for camp, need in camp_needs.items():
        print(f"  {camp}: {need:.2f}")
        
    print(f"\nResource Allocation (Total kits = {total_resources}):")
    for alpha in [0.0, 0.3, 0.7, 1.0]:
        allocations = allocate_resources(camp_needs, total_resources, alpha=alpha)
        desc = {
            0.0: "Max Utility (proportional to need)",
            0.3: "Balanced Utility-Fairness (alpha = 0.3)",
            0.7: "Balanced Utility-Fairness (alpha = 0.7)",
            1.0: "Max Fairness (equal distribution)"
        }[alpha]
        print(f"  Alpha = {alpha} ({desc}):")
        for camp, val in allocations.items():
            print(f"    {camp}: {val} kits")
            
if __name__ == "__main__":
    main()
