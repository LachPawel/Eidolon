export interface IndustryTemplate {
  name: string;
  organizations: string[];
  articlePrefixes: string[];
  articleSuffixes: string[];
  fieldTemplates: FieldTemplate[];
}

export interface FieldTemplate {
  fieldKey: string;
  fieldLabel: string;
  fieldType: "text" | "number" | "boolean" | "select";
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    options?: string[];
  };
}

export const industryTemplates: Record<string, IndustryTemplate> = {
  "medicine-pharma": {
    name: "Medicine & Pharma",
    organizations: [
      "PharmaCorp International",
      "MediTech Solutions",
      "HealthCare Innovations",
      "BioPharm Industries",
      "Global Medicine Labs",
      "PharmaVision Corp",
      "MedSupply Partners",
      "Clinical Products Inc",
      "DrugTech Manufacturing",
      "Therapeutic Solutions Ltd",
    ],
    articlePrefixes: [
      "Tablet",
      "Capsule",
      "Syrup",
      "Injection",
      "Ointment",
      "Cream",
      "Vaccine",
      "Serum",
      "Solution",
      "Suspension",
    ],
    articleSuffixes: [
      "500mg",
      "250mg",
      "100ml",
      "50ml",
      "Regular",
      "Extended Release",
      "Fast Acting",
      "Pediatric",
      "Adult",
      "Concentrated",
    ],
    fieldTemplates: [
      {
        fieldKey: "batch_number",
        fieldLabel: "Batch Number",
        fieldType: "text",
        validation: { required: true },
      },
      {
        fieldKey: "expiry_date",
        fieldLabel: "Expiry Date",
        fieldType: "text",
        validation: { required: true },
      },
      {
        fieldKey: "quantity",
        fieldLabel: "Quantity (units)",
        fieldType: "number",
        validation: { required: true, min: 1, max: 10000 },
      },
      {
        fieldKey: "temperature",
        fieldLabel: "Storage Temperature (°C)",
        fieldType: "number",
        validation: { required: true, min: -20, max: 30 },
      },
      {
        fieldKey: "quality_check",
        fieldLabel: "Quality Check",
        fieldType: "select",
        validation: {
          required: true,
          options: ["Pass", "Fail", "Retest"],
        },
      },
      {
        fieldKey: "sterility_test",
        fieldLabel: "Sterility Test",
        fieldType: "select",
        validation: {
          required: true,
          options: ["Sterile", "Non-Sterile", "Pending"],
        },
      },
      {
        fieldKey: "pH_level",
        fieldLabel: "pH Level",
        fieldType: "number",
        validation: { required: false, min: 0, max: 14 },
      },
      {
        fieldKey: "packaging_intact",
        fieldLabel: "Packaging Intact",
        fieldType: "boolean",
        validation: { required: true },
      },
    ],
  },

  "metal-automotive": {
    name: "Metal & Automotive",
    organizations: [
      "SteelWorks Manufacturing",
      "AutoParts Global",
      "MetalTech Industries",
      "Precision Engineering Corp",
      "Automotive Components Ltd",
      "Heavy Metal Solutions",
      "DriveChain Manufacturing",
      "Industrial Metals Inc",
      "CarTech Productions",
      "Forge & Fabrication Co",
    ],
    articlePrefixes: [
      "Steel",
      "Aluminum",
      "Engine",
      "Brake",
      "Suspension",
      "Transmission",
      "Exhaust",
      "Chassis",
      "Bearing",
      "Shaft",
    ],
    articleSuffixes: [
      "Component",
      "Assembly",
      "Part A",
      "Part B",
      "Module",
      "System",
      "Kit",
      "Unit",
      "Series X",
      "Pro",
    ],
    fieldTemplates: [
      {
        fieldKey: "material_grade",
        fieldLabel: "Material Grade",
        fieldType: "text",
        validation: { required: true },
      },
      {
        fieldKey: "weight",
        fieldLabel: "Weight (kg)",
        fieldType: "number",
        validation: { required: true, min: 0.1, max: 500 },
      },
      {
        fieldKey: "dimensions",
        fieldLabel: "Dimensions (mm)",
        fieldType: "text",
        validation: { required: true },
      },
      {
        fieldKey: "hardness_test",
        fieldLabel: "Hardness Test (HRC)",
        fieldType: "number",
        validation: { required: true, min: 20, max: 70 },
      },
      {
        fieldKey: "surface_finish",
        fieldLabel: "Surface Finish",
        fieldType: "select",
        validation: {
          required: true,
          options: ["Polished", "Matte", "Coated", "Anodized"],
        },
      },
      {
        fieldKey: "tensile_strength",
        fieldLabel: "Tensile Strength (MPa)",
        fieldType: "number",
        validation: { required: false, min: 100, max: 2000 },
      },
      {
        fieldKey: "heat_treatment",
        fieldLabel: "Heat Treatment",
        fieldType: "select",
        validation: {
          required: true,
          options: ["Annealed", "Quenched", "Tempered", "None"],
        },
      },
      {
        fieldKey: "corrosion_test",
        fieldLabel: "Corrosion Test Passed",
        fieldType: "boolean",
        validation: { required: true },
      },
    ],
  },

  "plastic-textile": {
    name: "Plastic & Textile",
    organizations: [
      "PolyTech Plastics",
      "Textile Mills International",
      "Synthetic Fabrics Corp",
      "PlasticWorks Ltd",
      "FiberTech Industries",
      "Modern Textiles Inc",
      "Polymer Solutions",
      "Fabric Innovations",
      "PlastiPro Manufacturing",
      "Weave & Mold Co",
    ],
    articlePrefixes: [
      "Polymer",
      "Fabric",
      "Thread",
      "Sheet",
      "Film",
      "Container",
      "Fiber",
      "Textile",
      "Molded",
      "Woven",
    ],
    articleSuffixes: [
      "Roll",
      "Sheet",
      "Grade A",
      "Grade B",
      "Premium",
      "Standard",
      "Heavy Duty",
      "Lightweight",
      "Colored",
      "Natural",
    ],
    fieldTemplates: [
      {
        fieldKey: "material_type",
        fieldLabel: "Material Type",
        fieldType: "text",
        validation: { required: true },
      },
      {
        fieldKey: "thickness",
        fieldLabel: "Thickness (mm)",
        fieldType: "number",
        validation: { required: true, min: 0.1, max: 50 },
      },
      {
        fieldKey: "color",
        fieldLabel: "Color",
        fieldType: "text",
        validation: { required: true },
      },
      {
        fieldKey: "length",
        fieldLabel: "Length (meters)",
        fieldType: "number",
        validation: { required: true, min: 1, max: 1000 },
      },
      {
        fieldKey: "density",
        fieldLabel: "Density (g/cm³)",
        fieldType: "number",
        validation: { required: true, min: 0.5, max: 3.0 },
      },
      {
        fieldKey: "flexibility_test",
        fieldLabel: "Flexibility Test",
        fieldType: "select",
        validation: {
          required: true,
          options: ["Flexible", "Semi-Rigid", "Rigid"],
        },
      },
      {
        fieldKey: "uv_resistance",
        fieldLabel: "UV Resistance",
        fieldType: "select",
        validation: {
          required: true,
          options: ["High", "Medium", "Low", "None"],
        },
      },
      {
        fieldKey: "flame_retardant",
        fieldLabel: "Flame Retardant",
        fieldType: "boolean",
        validation: { required: true },
      },
    ],
  },

  "chemistry-process": {
    name: "Chemistry & Process",
    organizations: [
      "Chemical Industries Corp",
      "Process Solutions Ltd",
      "ReactorTech International",
      "Industrial Chemistry Inc",
      "Catalyst Manufacturing",
      "ChemProcess Partners",
      "Synthesis Solutions",
      "Refinery Products Co",
      "Laboratory Chemicals",
      "Process Engineering Corp",
    ],
    articlePrefixes: [
      "Catalyst",
      "Reagent",
      "Solvent",
      "Acid",
      "Base",
      "Polymer",
      "Solution",
      "Compound",
      "Mixture",
      "Substrate",
    ],
    articleSuffixes: [
      "Grade A",
      "Technical",
      "Analytical",
      "Industrial",
      "Pure",
      "Refined",
      "Concentrated",
      "Diluted",
      "Special",
      "Standard",
    ],
    fieldTemplates: [
      {
        fieldKey: "cas_number",
        fieldLabel: "CAS Number",
        fieldType: "text",
        validation: { required: true },
      },
      {
        fieldKey: "purity",
        fieldLabel: "Purity (%)",
        fieldType: "number",
        validation: { required: true, min: 50, max: 100 },
      },
      {
        fieldKey: "concentration",
        fieldLabel: "Concentration (mol/L)",
        fieldType: "number",
        validation: { required: true, min: 0.1, max: 20 },
      },
      {
        fieldKey: "volume",
        fieldLabel: "Volume (L)",
        fieldType: "number",
        validation: { required: true, min: 0.1, max: 1000 },
      },
      {
        fieldKey: "hazard_class",
        fieldLabel: "Hazard Class",
        fieldType: "select",
        validation: {
          required: true,
          options: ["Flammable", "Corrosive", "Toxic", "Oxidizing", "Non-Hazardous"],
        },
      },
      {
        fieldKey: "storage_condition",
        fieldLabel: "Storage Condition",
        fieldType: "select",
        validation: {
          required: true,
          options: ["Room Temperature", "Refrigerated", "Frozen", "Inert Atmosphere"],
        },
      },
      {
        fieldKey: "viscosity",
        fieldLabel: "Viscosity (cP)",
        fieldType: "number",
        validation: { required: false, min: 0.1, max: 10000 },
      },
      {
        fieldKey: "stability_test",
        fieldLabel: "Stability Test Passed",
        fieldType: "boolean",
        validation: { required: true },
      },
    ],
  },
};
