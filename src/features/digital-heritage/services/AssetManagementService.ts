import { supabase } from "@/lib/supabase";
import {
  DigitalAsset,
  AssetTransfer,
  ValueMaximization,
  ValueStrategy,
  StrategyType,
  RiskLevel,
  TransferStatus,
  ConditionType,
  Beneficiary,
  CreateAssetRequest,
  UpdateAssetRequest,
} from "../types";

export class AssetManagementService {
  /**
   * Create a new digital asset with comprehensive metadata and security
   */
  async createAsset(request: CreateAssetRequest): Promise<DigitalAsset> {
    const { data, error } = await supabase
      .from("assets")
      .insert({
        type: request.type,
        name: request.name,
        description: request.description,
        value: request.value,
        currency: request.currency,
        metadata: request.metadata || {},
        ownership: {
          owner_id: request.userId,
          backup_contacts: [],
          legal_status: "pending",
        },
        transfer_conditions: request.transferConditions || [],
        encryption: {
          algorithm: "AES-256-GCM",
          key_id: `key_${Date.now()}`,
          encrypted_fields: ["privateKey", "recoveryPhrase"],
          rotation_schedule: "quarterly",
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create asset: ${error.message}`);
    }

    return this.mapToDigitalAsset(data);
  }

  /**
   * Get asset with decrypted sensitive data
   */
  async getAsset(id: string, userId: string): Promise<DigitalAsset | null> {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("id", id)
      .eq("ownership->>owner_id", userId)
      .single();

    if (error) {
      return null;
    }

    return this.mapToDigitalAsset(data);
  }

  /**
   * Get all assets for a user with pagination
   */
  async getUserAssets(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<{
    assets: DigitalAsset[];
    total: number;
  }> {
    const {
      data: assets,
      error,
      count,
    } = await supabase
      .from("assets")
      .select("*", { count: "exact" })
      .eq("ownership->>owner_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get assets: ${error.message}`);
    }

    return {
      assets: assets.map(this.mapToDigitalAsset),
      total: count || 0,
    };
  }

  /**
   * Update asset value and trigger value maximization analysis
   */
  async updateAssetValue(
    assetId: string,
    newValue: number,
    userId: string,
  ): Promise<DigitalAsset> {
    const { data, error } = await supabase
      .from("assets")
      .update({
        value: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assetId)
      .eq("ownership->>owner_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update asset value: ${error.message}`);
    }

    // Trigger value maximization analysis
    await this.analyzeValueMaximization(assetId);

    return this.mapToDigitalAsset(data);
  }

  /**
   * Analyze and optimize asset value
   */
  async analyzeValueMaximization(assetId: string): Promise<ValueMaximization> {
    const asset = await this.getAsset(assetId, "");
    if (!asset) {
      throw new Error("Asset not found");
    }

    const strategies = await this.generateValueStrategies(asset);
    const projectedValue = this.calculateProjectedValue(
      asset.value,
      strategies,
    );

    const maximization: ValueMaximization = {
      assetId,
      strategies,
      currentValue: asset.value,
      projectedValue,
      lastOptimization: new Date(),
      nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      riskLevel: this.calculateRiskLevel(strategies),
    };

    // Store analysis
    await supabase.from("value_maximizations").upsert({
      asset_id: assetId,
      strategies: JSON.stringify(strategies),
      current_value: asset.value,
      projected_value: projectedValue,
      last_optimization: maximization.lastOptimization,
      next_review: maximization.nextReview,
      risk_level: maximization.riskLevel,
    });

    return maximization;
  }

  /**
   * Generate value maximization strategies based on asset type
   */
  private async generateValueStrategies(
    asset: DigitalAsset,
  ): Promise<ValueStrategy[]> {
    const strategies: ValueStrategy[] = [];

    switch (asset.type) {
      case "cryptocurrency":
        strategies.push(
          {
            type: StrategyType.STAKING,
            description: "Stake cryptocurrency for passive income",
            implementation: "Connect to staking platform",
            expectedReturn: 0.05, // 5% annual
            risk: RiskLevel.LOW,
            timeline: "1 year",
          },
          {
            type: StrategyType.YIELD_FARMING,
            description: "Participate in DeFi yield farming",
            implementation: "Provide liquidity to DEX pools",
            expectedReturn: 0.15, // 15% annual
            risk: RiskLevel.MEDIUM,
            timeline: "6 months",
          },
        );
        break;

      case "nft":
        strategies.push({
          type: StrategyType.LIQUIDITY_PROVISION,
          description: "List NFT on multiple marketplaces",
          implementation: "Cross-list on OpenSea, Rarible, Foundation",
          expectedReturn: 0.2, // 20% potential increase
          risk: RiskLevel.MEDIUM,
          timeline: "3 months",
        });
        break;

      case "investment_account":
        strategies.push(
          {
            type: StrategyType.REBALANCING,
            description: "Rebalance portfolio based on market conditions",
            implementation: "Adjust allocation between stocks and bonds",
            expectedReturn: 0.08, // 8% annual
            risk: RiskLevel.LOW,
            timeline: "1 year",
          },
          {
            type: StrategyType.TAX_OPTIMIZATION,
            description: "Optimize tax efficiency",
            implementation: "Tax-loss harvesting and strategic withdrawals",
            expectedReturn: 0.03, // 3% tax savings
            risk: RiskLevel.LOW,
            timeline: "Annual",
          },
        );
        break;
    }

    return strategies;
  }

  /**
   * Calculate projected value based on strategies
   */
  private calculateProjectedValue(
    currentValue: number,
    strategies: ValueStrategy[],
  ): number {
    let totalReturn = 1;

    for (const strategy of strategies) {
      totalReturn *= 1 + strategy.expectedReturn;
    }

    return Math.round(currentValue * totalReturn * 100) / 100;
  }

  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(strategies: ValueStrategy[]): RiskLevel {
    const riskScores = {
      [RiskLevel.LOW]: 1,
      [RiskLevel.MEDIUM]: 2,
      [RiskLevel.HIGH]: 3,
      [RiskLevel.VERY_HIGH]: 4,
    };

    const averageRisk =
      strategies.reduce((sum, s) => sum + riskScores[s.risk], 0) /
      strategies.length;

    if (averageRisk <= 1.5) return RiskLevel.LOW;
    if (averageRisk <= 2.5) return RiskLevel.MEDIUM;
    if (averageRisk <= 3.5) return RiskLevel.HIGH;
    return RiskLevel.VERY_HIGH;
  }

  /**
   * Map database record to DigitalAsset
   */
  private mapToDigitalAsset(data: Record<string, unknown>): DigitalAsset {
    return {
      id: data.id as string,
      type: data.type as DigitalAsset["type"],
      name: data.name as string,
      description: data.description as string,
      value: data.value as number,
      currency: data.currency as string,
      metadata: (data.metadata || {}) as Record<string, unknown>,
      ownership: (data.ownership || {}) as DigitalAsset["ownership"],
      transferConditions: (data.transfer_conditions ||
        []) as DigitalAsset["transferConditions"],
      encryption: (data.encryption || {}) as DigitalAsset["encryption"],
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }

  /**
   * Get value maximization analysis for an asset
   */
  async getValueMaximization(
    assetId: string,
  ): Promise<ValueMaximization | null> {
    const { data, error } = await supabase
      .from("value_maximizations")
      .select("*")
      .eq("asset_id", assetId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      assetId: data.asset_id,
      strategies: JSON.parse(data.strategies || "[]"),
      currentValue: data.current_value,
      projectedValue: data.projected_value,
      lastOptimization: new Date(data.last_optimization),
      nextReview: new Date(data.next_review),
      riskLevel: data.risk_level,
    };
  }

  /**
   * Schedule value review for all assets
   */
  async scheduleValueReviews(): Promise<void> {
    const { data: assets } = await supabase.from("assets").select("id");

    if (assets) {
      await Promise.all(
        assets.map((asset) => this.analyzeValueMaximization(asset.id)),
      );
    }
  }
}

export const assetManagementService = new AssetManagementService();
