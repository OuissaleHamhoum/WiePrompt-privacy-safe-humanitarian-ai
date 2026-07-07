import csv
import random
import os

def generate_synthetic_data(file_path, num_records=10000, seed=42):
    """
    Generates synthetic household-level data for 3 refugee camps.
    No real personal identifier (like names or exact locations) is included.

    A fixed seed is used by default so the dataset (and every downstream
    demo number quoted in the README / Do-No-Harm assessment) is
    reproducible across machines and runs.
    """
    random.seed(seed)
    camps = ["Camp Alpha", "Camp Beta", "Camp Gamma"]
    genders = ["Female", "Male", "Other"]
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        # Header
        writer.writerow([
            "household_id", 
            "camp_name", 
            "family_size", 
            "head_gender", 
            "head_age_group",  # generalized age to reduce re-identification risk
            "food_insecurity_score",  # 0 to 1 (1 is highest need)
            "shelter_damage_score",   # 0 to 1
            "chronic_disease_present",# 0 or 1
            "vulnerability_index"     # calculated target metric
        ])
        
        for i in range(1, num_records + 1):
            camp = random.choice(camps)
            family_size = random.randint(1, 10)
            gender = random.choices(genders, weights=[0.55, 0.40, 0.05])[0] # often female-headed in vulnerable populations
            
            # Generalized age groups (anonymization technique)
            age_group = random.choices(
                ["18-25", "26-35", "36-50", "51-65", "65+"], 
                weights=[0.15, 0.35, 0.30, 0.15, 0.05]
            )[0]
            
            # Draw scores with slight correlations to camp conditions
            if camp == "Camp Alpha":
                # Alpha has severe food shortages
                food_score = round(random.betavariate(5, 2), 2)
                shelter_score = round(random.betavariate(2, 5), 2)
                chronic_disease = 1 if random.random() < 0.18 else 0
            elif camp == "Camp Beta":
                # Beta has poor shelter infrastructure
                food_score = round(random.betavariate(3, 4), 2)
                shelter_score = round(random.betavariate(6, 2), 2)
                chronic_disease = 1 if random.random() < 0.25 else 0
            else:
                # Gamma has health/disease challenges
                food_score = round(random.betavariate(2, 3), 2)
                shelter_score = round(random.betavariate(3, 3), 2)
                chronic_disease = 1 if random.random() < 0.35 else 0
                
            # Compound vulnerability index calculation (simulated ground truth)
            vuln_index = round(
                (food_score * 0.4) + 
                (shelter_score * 0.3) + 
                (chronic_disease * 0.2) + 
                ((family_size / 10.0) * 0.1), 
                2
            )
            
            writer.writerow([
                f"HH_{i:05d}",
                camp,
                family_size,
                gender,
                age_group,
                food_score,
                shelter_score,
                chronic_disease,
                vuln_index
            ])
            
    print(f"Successfully generated {num_records} synthetic records at: {file_path}")

if __name__ == "__main__":
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "synthetic_refugee_data.csv")
    generate_synthetic_data(output_path)
