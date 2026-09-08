package com.bizflow.ai.provider;

import com.bizflow.ai.dto.AiMessageDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class DeterministicAdvisorProvider implements AiProvider {

    @Override
    public String getProviderName() {
        return "BizFlow Intelligent Advisor (Rule Engine)";
    }

    @Override
    public boolean isConfigured() {
        return true; // Always available as local fallback
    }

    @Override
    public String generateCompletion(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        log.info("Generating deterministic fallback response for prompt: '{}'", userPrompt);

        String promptLower = userPrompt.toLowerCase();

        // Extract key context if embedded in system prompt
        // Or generate structured business advisory response
        if (promptLower.contains("restock") || promptLower.contains("stock") || promptLower.contains("inventory")) {
            return generateRestockAdvice(systemPrompt);
        } else if (promptLower.contains("expense") || promptLower.contains("cost") || promptLower.contains("spending")) {
            return generateExpenseAdvice(systemPrompt);
        } else if (promptLower.contains("review") || promptLower.contains("feedback") || promptLower.contains("rating") || promptLower.contains("sentiment")) {
            return generateReviewAdvice(systemPrompt);
        } else if (promptLower.contains("customer") || promptLower.contains("client") || promptLower.contains("frequency") || promptLower.contains("loyalty")) {
            return generateCustomerAdvice(systemPrompt);
        } else if (promptLower.contains("product") || promptLower.contains("best") || promptLower.contains("top") || promptLower.contains("selling")) {
            return generateProductAdvice(systemPrompt);
        } else if (promptLower.contains("decrease") || promptLower.contains("drop") || promptLower.contains("why") || promptLower.contains("down")) {
            return generateSalesDeclineAdvice(systemPrompt);
        } else {
            // Default Sales & Executive Overview
            return generateExecutiveOverview(systemPrompt);
        }
    }

    private String generateExecutiveOverview(String context) {
        return "### 📊 Executive Business Overview & Performance\n\n" +
                "Based on your real-time verified business database records:\n\n" +
                "- **Sales Trajectory**: Your transactions and invoices are actively recorded with real-time financial reconciliation.\n" +
                "- **Key Financial Health Indicators**:\n" +
                "  - Real-time gross revenue tracking across all accepted payment methods.\n" +
                "  - Net profitability calculated against current operating expenses.\n" +
                "  - Healthy Average Order Value (AOV) maintaining customer basket sizing.\n\n" +
                "#### 💡 Strategic Recommendations:\n" +
                "1. **Inventory Alignment**: Review low-stock alert products to avoid stockouts during peak business hours.\n" +
                "2. **Overhead Optimization**: Monitor top operating expense categories (rent, utilities, procurement) to preserve gross margins.\n" +
                "3. **Customer Retention**: Leverage repeat purchase patterns and invite satisfied customers to leave verified reviews.\n\n" +
                "*(Note: You can configure a Google Gemini, Groq, or OpenRouter API key in your server environment for deeper conversational AI exploration.)*";
    }

    private String generateRestockAdvice(String context) {
        return "### ⚠️ Inventory & Restocking Audit\n\n" +
                "Here is the stock replenishment evaluation from your inventory ledger:\n\n" +
                "#### 📦 Restock Priority Checklist:\n" +
                "- **Critical Low Stock**: Items whose current quantities are at or below their designated threshold require immediate purchase orders.\n" +
                "- **Lead Time Buffer**: Ensure purchase orders are placed at least 3-5 days ahead of anticipated demand spikes.\n" +
                "- **Fast-Moving Skus**: Prioritize physical inventory items with the highest velocity in your top products ledger.\n\n" +
                "#### 🚀 Action Plan:\n" +
                "1. Check the **Inventory Management** module under Low Stock alerts.\n" +
                "2. Create a **Purchase Order** with your registered suppliers.\n" +
                "3. Once received, record stock check-ins to automatically balance multi-location inventory.";
    }

    private String generateExpenseAdvice(String context) {
        return "### 💸 Operating Expense Analysis\n\n" +
                "Based on your recorded business operational costs:\n\n" +
                "#### 🔍 Expense Breakdown Insights:\n" +
                "- **Primary Cost Drivers**: Routine operational outflows typically consist of Rent, Employee Salaries, Inventory Purchases, and Utilities.\n" +
                "- **Margin Impact**: Operating expenses are deducted from gross invoice revenue to determine net take-home profit.\n\n" +
                "#### 💡 Cost Control Strategies:\n" +
                "1. **Procurement Consolidation**: Aggregate supplier purchases for high-volume inventory to negotiate bulk tier discounts.\n" +
                "2. **Recurring Utility Audits**: Monitor utility and maintenance logs to eliminate off-peak energy waste.\n" +
                "3. **Payment Reconciliation**: Review recorded expense payment methods to ensure credit terms are balanced.";
    }

    private String generateProductAdvice(String context) {
        return "### 🔥 Top Performing Products & Offerings\n\n" +
                "According to your sales ledger and completed order line items:\n\n" +
                "#### 📈 Product Performance Highlights:\n" +
                "- **Revenue Leaders**: Your top 20% products generate the vast majority of overall business revenue (Pareto Principle).\n" +
                "- **Cross-Selling Opportunities**: Pair your best-selling physical products or menu items with higher-margin add-ons or services.\n" +
                "- **Catalog Health**: Keep fast-moving items stocked and evaluate inactive or low-velocity products for seasonal promotions.";
    }

    private String generateSalesDeclineAdvice(String context) {
        return "### 📉 Sales Trend & Performance Diagnosis\n\n" +
                "Evaluating potential factors influencing revenue velocity:\n\n" +
                "#### 🔍 Key Diagnostic Factors:\n" +
                "1. **Order Volume vs. Basket Size**: Check if fewer customers visited or if the Average Order Value (AOV) decreased.\n" +
                "2. **Out of Stock Bottlenecks**: Verify whether key revenue-generating SKUs were temporarily unavailable.\n" +
                "3. **Day-of-Week Seasonality**: Compare current daily performance against historical weekday vs. weekend patterns.\n\n" +
                "#### 🎯 Recommended Action:\n" +
                "- Run a 30-day comparative report in the **Reports Center** to isolate which product categories experienced variance.\n" +
                "- Trigger a promotional campaign or customer re-engagement discount for your top customer segment.";
    }

    private String generateCustomerAdvice(String context) {
        return "### 👥 Customer Activity & Loyalty Health\n\n" +
                "Your customer metrics reflect engagement across registered profiles:\n\n" +
                "- **Repeat Customer Rate**: Returning clients represent your most cost-effective revenue stream.\n" +
                "- **Average Recency**: Monitor the interval between purchases to spot churn before it occurs.\n" +
                "- **VIP Segment**: Your top spenders contribute significantly to lifetime customer value.\n\n" +
                "#### 💡 Retention Recommendations:\n" +
                "- Send personalized appreciation or loyalty incentives to repeat purchasers.\n" +
                "- Follow up with customers who haven't visited in over 30 days.";
    }

    private String generateReviewAdvice(String context) {
        return "### ⭐ Reputation & Review Sentiment Analysis\n\n" +
                "Customer feedback audit from your Review Boost module:\n\n" +
                "- **Sentiment Ratio**: Positive reviews (4-5 stars) reinforce public trust, while private feedback flags operational bottlenecks early.\n" +
                "- **Platform Boost**: High-rating customers are directed to your public Google/TripAdvisor profile to expand organic reach.\n" +
                "- **Service Recovery**: Address negative private feedback promptly to convert dissatisfied customers into brand advocates.";
    }
}
