import { supabase } from "@/lib/supabase";

export interface WillTemplate {
  id: string;
  country_code: string;
  language_code: string;
  template_name: string;
  template_body: string;
  execution_instructions: string;
  legal_guidance: Record<string, unknown>;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface WillTemplateFormData {
  country_code: string;
  language_code: string;
  template_name: string;
  template_body: string;
  execution_instructions: string;
  legal_guidance: Record<string, unknown>;
}

export class WillTemplateService {
  /**
   * Get will template for a specific country and language
   */
  static async getTemplate(
    countryCode: string,
    languageCode?: string,
  ): Promise<WillTemplate | null> {
    try {
      let query = supabase
        .from("will_templates")
        .select("*")
        .eq("country_code", countryCode)
        .eq("is_active", true)
        .order("version", { ascending: false })
        .limit(1);

      if (languageCode) {
        query = query.eq("language_code", languageCode);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error("Error fetching will template:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getTemplate:", error);
      return null;
    }
  }

  /**
   * Get all active templates (for admin interface)
   */
  static async getAllTemplates(): Promise<WillTemplate[]> {
    try {
      const { data, error } = await supabase
        .from("will_templates")
        .select("*")
        .eq("is_active", true)
        .order("country_code", { ascending: true })
        .order("language_code", { ascending: true });

      if (error) {
        console.error("Error fetching all templates:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllTemplates:", error);
      return [];
    }
  }

  /**
   * Create a new will template (admin only)
   */
  static async createTemplate(
    templateData: WillTemplateFormData,
  ): Promise<WillTemplate | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("will_templates")
        .insert({
          ...templateData,
          created_by: userData?.user?.id,
          updated_by: userData?.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating template:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in createTemplate:", error);
      throw error;
    }
  }

  /**
   * Update an existing will template (admin only)
   */
  static async updateTemplate(
    templateId: string,
    updates: Partial<WillTemplateFormData>,
  ): Promise<WillTemplate | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("will_templates")
        .update({
          ...updates,
          updated_by: userData?.user?.id,
        })
        .eq("id", templateId)
        .select()
        .single();

      if (error) {
        console.error("Error updating template:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateTemplate:", error);
      throw error;
    }
  }

  /**
   * Deactivate a template (soft delete)
   */
  static async deactivateTemplate(templateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("will_templates")
        .update({ is_active: false })
        .eq("id", templateId);

      if (error) {
        console.error("Error deactivating template:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deactivateTemplate:", error);
      return false;
    }
  }

  /**
   * Get template audit history
   */
  static async getTemplateAuditHistory(templateId: string) {
    try {
      const { data, error } = await supabase
        .from("will_template_audit")
        .select(
          `
          *,
          changed_by_user:auth.users(email)
        `,
        )
        .eq("template_id", templateId)
        .order("changed_at", { ascending: false });

      if (error) {
        console.error("Error fetching audit history:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getTemplateAuditHistory:", error);
      return [];
    }
  }

  /**
   * Get available countries with templates
   */
  static async getAvailableCountries(): Promise<
    Array<{ code: string; name: string; languages: string[] }>
  > {
    try {
      const { data, error } = await supabase
        .from("will_templates")
        .select("country_code, language_code")
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching countries:", error);
        return [];
      }

      // Group by country
      const countriesMap = new Map<string, Set<string>>();
      data?.forEach((template) => {
        if (!countriesMap.has(template.country_code)) {
          countriesMap.set(template.country_code, new Set());
        }
        countriesMap.get(template.country_code)?.add(template.language_code);
      });

      // Convert to array format
      const countries = Array.from(countriesMap.entries()).map(
        ([code, languages]) => ({
          code,
          name: this.getCountryName(code),
          languages: Array.from(languages),
        }),
      );

      return countries;
    } catch (error) {
      console.error("Error in getAvailableCountries:", error);
      return [];
    }
  }

  /**
   * Helper to get country name from code
   */
  private static getCountryName(code: string): string {
    const countryNames: Record<string, string> = {
      FR: "France",
      DE: "Germany",
      "GB-ENG": "England",
      "GB-SCT": "Scotland",
      "GB-WAL": "Wales",
      "GB-NIR": "Northern Ireland",
      ES: "Spain",
      IT: "Italy",
      PT: "Portugal",
      NL: "Netherlands",
      BE: "Belgium",
      CH: "Switzerland",
      AT: "Austria",
      IE: "Ireland",
      US: "United States",
      CA: "Canada",
      AU: "Australia",
      NZ: "New Zealand",
      CZ: "Czech Republic",
    };

    return countryNames[code] || code;
  }

  /**
   * Validate template placeholders
   */
  static validateTemplatePlaceholders(templateBody: string): string[] {
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const matches = templateBody.match(placeholderRegex) || [];
    return matches.map((match) => match.replace(/\{\{|\}\}/g, "").trim());
  }

  /**
   * Fill template with user data
   */
  static fillTemplate(
    template: WillTemplate,
    userData: Record<string, unknown>,
  ): string {
    let filledTemplate = template.template_body;

    // Replace simple placeholders
    Object.entries(userData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      filledTemplate = filledTemplate.replace(regex, value || "");
    });

    // Handle conditional blocks (basic implementation)
    // {{#if condition}}content{{/if}}
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    filledTemplate = filledTemplate.replace(
      conditionalRegex,
      (match, condition, content) => {
        return userData[condition] ? content : "";
      },
    );

    // Handle each loops (basic implementation)
    // {{#each array}}{{this.property}}{{/each}}
    const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    filledTemplate = filledTemplate.replace(
      eachRegex,
      (match, arrayName, content) => {
        const array = userData[arrayName];
        if (!Array.isArray(array)) return "";

        return array
          .map((item) => {
            let itemContent = content;
            Object.entries(item).forEach(([key, value]) => {
              const itemRegex = new RegExp(`\\{\\{this\\.${key}\\}\\}`, "g");
              itemContent = itemContent.replace(itemRegex, value || "");
            });
            return itemContent;
          })
          .join("\n");
      },
    );

    return filledTemplate;
  }
}
