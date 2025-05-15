# FASTCars Project Overview

**FASTCars** is an integrated system combining **Hardware**, **AI and Computer Vision**, and **Web Development** to provide a comprehensive solution for:

- **Overspeeding Detection**
- **License Plate Recognition**
- **Fine Management System**

---

## Setup Instructions

To set up and run FASTCars, please follow the steps below:

### 1. Required Tools and Hardware

- **Python IDE** (Recommended: Jupyter Notebook)  
- **Arduino IDE**  
- **Physical Camera** (for capturing vehicle images)  
- **2 IR Sensors** (or any two sensors suitable for speed detection)

### 2. Directory Paths

Several code files rely on hardcoded directory paths.  
Ensure the specified directories exist or update the paths in the code according to your environment.

### 3. AI and Server Configuration

- The AI Server was originally run on **Google Colab** for GPU support.  
  You may use any Python-compatible environment, but using one with **GPU/server capabilities** is highly recommended for performance.

#### API Keys

- Stored in a `secrets.json` file hosted on Google Drive.  
- You must either:  
  - Update the code to match your local structure, or  
  - Provide your own API keys for the relevant services.

### 4. Web Application

- The web system was initially designed with **FAST NUCES** in mind.  
- You are encouraged to customize the interface, data structure, and integration points according to your own institutional or project requirements.

---

## Documentation

For detailed information, please refer to the files in the `documents/` folder.

---
