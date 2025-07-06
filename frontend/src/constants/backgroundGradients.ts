// Background Colors and Gradients for Shortcut Store
// This file contains different gradient options that can be easily tested and switched

interface GradientConfig {
  name: string;
  description: string;
  classes: string;
  customCSS: string;
  darkModeCSS?: string;
  colors: {
    top: string;
    middle: string;
    bottom: string;
  };
}

interface SolidColors {
  white: string;
  lightGray: string;
  darkGray: string;
  black: string;
  teal: string;
  darkGreen: string;
  veryDarkGreen: string;
}

export const backgroundGradients: Record<string, GradientConfig> = {
  // Gradient 1: Dark green to very dark green
  gradient1: {
    name: "Dark Green Gradient",
    description: "Dark green top fading to very dark green bottom",
    classes: "bg-gradient-to-b from-[#034c36] to-[#003332]",
    customCSS: `
      background: linear-gradient(to bottom, 
        #034c36 0%, 
        #003332 100%
      );
    `,
    darkModeCSS: `
      background: linear-gradient(to bottom, 
        #1a2e2e 0%, 
        #0d1a1a 50%, 
        #003332 100%
      );
    `,
    colors: {
      top: "#034c36",
      middle: "#034c36", 
      bottom: "#003332"
    }
  },

  // Placeholder for more gradients
  gradient2: {
    name: "Gradient 2",
    description: "To be defined",
    classes: "",
    customCSS: "",
    colors: {
      top: "",
      middle: "",
      bottom: ""
    }
  },

  gradient3: {
    name: "Gradient 3", 
    description: "To be defined",
    classes: "",
    customCSS: "",
    colors: {
      top: "",
      middle: "",
      bottom: ""
    }
  }
};

// Solid background colors
export const solidColors: SolidColors = {
  white: "#FFFFFF",
  lightGray: "#F8F9FA",
  darkGray: "#343A40",
  black: "#000000",
  teal: "#BDCDCF",
  darkGreen: "#034c36",
  veryDarkGreen: "#003332"
};

// Helper function to apply gradient to an element
export const applyGradient = (gradientKey: string, isDarkMode: boolean = false) => {
  const gradient = backgroundGradients[gradientKey];
  if (gradient) {
    if (isDarkMode && gradient.darkModeCSS) {
      return gradient.darkModeCSS;
    }
    return gradient.customCSS;
  }
  return '';
};

// Helper function to get gradient classes
export const getGradientClasses = (gradientKey: string) => {
  const gradient = backgroundGradients[gradientKey];
  return gradient ? gradient.classes : '';
};

export default backgroundGradients; 