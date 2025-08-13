import { WillTemplateService as BaseWillTemplateService, WillTemplate } from "@/features/will-generator/api/WillTemplateService";

export class WillTemplateService extends BaseWillTemplateService {
  static async generateWill(
    countryCode: string,
    type: string,
    lang: string,
    data: Record<string, unknown>,
  ): Promise<string> {
    // For now, we ignore `type` and just use country + language to fetch template
    const template: WillTemplate | null = await BaseWillTemplateService.getTemplate(
      countryCode.toUpperCase(),
      lang.toLowerCase(),
    );
    if (!template) {
      return "";
    }
    return BaseWillTemplateService.fillTemplate(template, data);
  }
}

export default WillTemplateService;


