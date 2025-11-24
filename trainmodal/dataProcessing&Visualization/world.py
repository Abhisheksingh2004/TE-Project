import pandas as pd
import matplotlib.pyplot as plt
import os

# Load dataset
df = pd.read_csv("../data/world.csv")

# Clean columns
df.columns = df.columns.str.strip()
df.rename(columns={"Electricity Consumption (TWh)": "Electricity_TWh"}, inplace=True)

# Convert numeric columns
df["Population"] = df["Population"].astype(str).str.replace(",", "").astype(float)
df["Electricity_TWh"] = df["Electricity_TWh"].astype(str).str.replace(",", "").astype(float)

# Aggregate year-wise totals (sum across all countries)
yearly_data = df.groupby("Year")[["Population", "Electricity_TWh"]].sum().reset_index()

# Ensure output directory
os.makedirs("output_images", exist_ok=True)

# --- Plot 1: Population trend ---
plt.figure(figsize=(8, 5))
plt.plot(yearly_data["Year"], yearly_data["Population"] / 1e9, color="blue", marker="o", linewidth=2)
plt.title("World — Population Growth Over Years")
plt.xlabel("Year")
plt.ylabel("Population (Billions)")
plt.grid(True, linestyle="--", alpha=0.6)
plt.tight_layout()
plt.savefig("output_images/world_population_trend.png", dpi=300, bbox_inches="tight")
plt.show()

# --- Plot 2: Energy consumption trend ---
plt.figure(figsize=(8, 5))
plt.plot(yearly_data["Year"], yearly_data["Electricity_TWh"], color="green", marker="x", linewidth=2)
plt.title("World — Electricity Consumption Over Years")
plt.xlabel("Year")
plt.ylabel("Electricity Consumption (TWh)")
plt.grid(True, linestyle="--", alpha=0.6)
plt.tight_layout()
plt.savefig("output_images/world_energy_trend.png", dpi=300, bbox_inches="tight")
plt.show()

print("Graphs saved in 'output_images' folder:")
print(" - world_population_trend.png")
print(" - world_energy_trend.png")
