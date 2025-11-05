/**
 * Template Placeholder Replacement Utility
 * 
 * Replaces {{variable_name}} placeholders in template strings with actual values.
 * Handles missing variables and provides error handling.
 */

export interface ReplacementOptions {
  /**
   * If true, throw error when variable is missing.
   * If false, leave placeholder as-is or use empty string.
   */
  strict?: boolean;
  
  /**
   * Default value to use when variable is missing (if strict is false)
   */
  defaultMissing?: string;
  
  /**
   * If true, escape HTML in replacement values
   */
  escapeHtml?: boolean;
}

/**
 * Replace placeholders in template string with variables
 * 
 * @param template - Template string with {{variable_name}} placeholders
 * @param variables - Object mapping variable names to values
 * @param options - Replacement options
 * @returns Template with placeholders replaced
 * @throws Error if strict mode is enabled and variable is missing
 */
export function replacePlaceholders(
  template: string,
  variables: Record<string, string | number | null | undefined>,
  options: ReplacementOptions = {}
): string {
  const {
    strict = false,
    defaultMissing = '',
    escapeHtml = false,
  } = options;

  // Find all placeholders: {{variable_name}}
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  
  return template.replace(placeholderRegex, (_match, variableName) => {
    const value = variables[variableName];
    
    // Handle missing variable
    if (value === undefined || value === null) {
      if (strict) {
        throw new Error(`Missing required variable: ${variableName}`);
      }
      return defaultMissing;
    }
    
    // Convert to string
    let stringValue = String(value);
    
    // Escape HTML if needed
    if (escapeHtml) {
      stringValue = escapeHtmlString(stringValue);
    }
    
    return stringValue;
  });
}

/**
 * Escape HTML special characters
 */
function escapeHtmlString(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
}

/**
 * Extract all variable names from a template
 * 
 * @param template - Template string with {{variable_name}} placeholders
 * @returns Array of unique variable names found in template
 */
export function extractVariableNames(template: string): string[] {
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();
  let match;
  
  while ((match = placeholderRegex.exec(template)) !== null) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}

