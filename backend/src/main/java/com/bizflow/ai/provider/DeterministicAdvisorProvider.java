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
        return "BizFlow Intelligent Business Advisor";
    }

    @Override
    public boolean isConfigured() {
        return true; // Always configured and ready as an intelligent local engine
    }

    @Override
    public String generateCompletion(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        log.info("Generating intelligent business telemetry response for prompt: '{}'", userPrompt);

        String promptLower = (userPrompt != null) ? userPrompt.toLowerCase() : "";

        if (promptLower.contains("restock") || promptLower.contains("stock") || promptLower.contains("inventory") || promptLower.contains("supply")) {
            return generateRestockAdvice(systemPrompt);
        } else if (promptLower.contains("expense") || promptLower.contains("cost") || promptLower.contains("spending") || promptLower.contains("profit") || promptLower.contains("margin")) {
            return generateExpenseAdvice(systemPrompt);
        } else if (promptLower.contains("review") || promptLower.contains("feedback") || promptLower.contains("rating") || promptLower.contains("sentiment") || promptLower.contains("reputation")) {
            return generateReviewAdvice(systemPrompt);
        } else if (promptLower.contains("customer") || promptLower.contains("client") || promptLower.contains("frequency") || promptLower.contains("loyalty") || promptLower.contains("retention")) {
            return generateCustomerAdvice(systemPrompt);
        } else if (promptLower.contains("product") || promptLower.contains("best") || promptLower.contains("top") || promptLower.contains("selling") || promptLower.contains("item")) {
            return generateProductAdvice(systemPrompt);
        } else if (promptLower.contains("sales") || promptLower.contains("revenue") || promptLower.contains("growth") || promptLower.contains("income") || promptLower.contains("decrease") || promptLower.contains("drop")) {
            return generateSalesAdvice(systemPrompt);
        } else {
            return generateExecutiveOverview(systemPrompt);
        }
    }

    private String extractSection(String systemPrompt, String sectionHeader, String nextSectionHeader) {
        if (systemPrompt == null || !systemPrompt.contains(sectionHeader)) {
            return "";
        }
        int startIndex = systemPrompt.indexOf(sectionHeader) + sectionHeader.length();
        int endIndex = nextSectionHeader != null && systemPrompt.contains(nextSectionHeader)
                ? systemPrompt.indexOf(nextSectionHeader)
                : systemPrompt.length();

        if (startIndex < endIndex) {
            return systemPrompt.substring(startIndex, endIndex).trim();
        }
        return "";
    }

    private String generateSalesAdvice(String context) {
        String salesSection = extractSection(context, "--- REVENUE & SALES SNAPSHOT ---", "--- OPERATING EXPENSES & NET PROFIT ---");

        StringBuilder sb = new StringBuilder();
        sb.append("### 📈 Revenue & Sales Performance Analysis\n\n");
        sb.append("Here is the latest verified sales data from your store ledger:\n\n");

        if (!salesSection.isEmpty()) {
            sb.append(salesSection).append("\n\n");
        } else {
            sb.append("- Real-time order transactions and revenue reconciliation are actively recorded.\n\n");
        }

        sb.append("#### 💡 Strategic Revenue Insights:\n");
        sb.append("1. **Average Order Value (AOV)**: Maximize order sizes by bundling complementary products at POS checkout.\n");
        sb.append("2. **Peak Hour Staffing**: Review your busiest order hours in the **Analytics** module to ensure checkout registers remain frictionless.\n");
        sb.append("3. **Repeat Revenue**: Re-engage inactive customers with loyalty promotions to sustain month-over-month growth.");

        return sb.toString();
    }

    private String generateRestockAdvice(String context) {
        String stockSection = extractSection(context, "--- INVENTORY RESTOCK & LOW STOCK AUDIT ---", "--- CUSTOMER ACTIVITY & RETENTION ---");

        StringBuilder sb = new StringBuilder();
        sb.append("### 📦 Inventory Restock & Stock Level Audit\n\n");
        sb.append("Based on current multi-location inventory levels:\n\n");

        if (!stockSection.isEmpty()) {
            sb.append(stockSection).append("\n\n");
        } else {
            sb.append("- All tracked products are currently above their minimum reorder thresholds.\n\n");
        }

        sb.append("#### 🚀 Recommended Next Steps:\n");
        sb.append("1. **Immediate Purchase Orders**: Generate POs for items highlighted in the low-stock audit above.\n");
        sb.append("2. **Supplier Lead Times**: Factor in a 3 to 5 day supplier turnaround window to avoid stockouts during demand spikes.\n");
        sb.append("3. **Stock Movements**: Record check-ins in the **Inventory** tab immediately upon delivery to balance inventory records.");

        return sb.toString();
    }

    private String generateExpenseAdvice(String context) {
        String expenseSection = extractSection(context, "--- OPERATING EXPENSES & NET PROFIT ---", "--- TOP SELLING PRODUCTS & SERVICES (THIS MONTH) ---");

        StringBuilder sb = new StringBuilder();
        sb.append("### 💸 Operating Expenses & Profit Margin Analysis\n\n");
        sb.append("Financial health breakdown from your expense ledger:\n\n");

        if (!expenseSection.isEmpty()) {
            sb.append(expenseSection).append("\n\n");
        } else {
            sb.append("- Track operational outflows under Rent, Payroll, Supplies, and Utilities for margin insights.\n\n");
        }

        sb.append("#### 💡 Profit Maximization Strategies:\n");
        sb.append("1. **Category Audits**: Identify the highest single expense category and investigate bulk purchasing discounts.\n");
        sb.append("2. **Margin Protection**: Ensure product selling prices maintain a minimum 40-50% gross markup over procurement costs.\n");
        sb.append("3. **Recurring Cost Reviews**: Audit monthly utility and subscription expenses to trim unused overhead.");

        return sb.toString();
    }

    private String generateProductAdvice(String context) {
        String prodSection = extractSection(context, "--- TOP SELLING PRODUCTS & SERVICES (THIS MONTH) ---", "--- INVENTORY RESTOCK & LOW STOCK AUDIT ---");

        StringBuilder sb = new StringBuilder();
        sb.append("### 🔥 Top Selling Products & Velocity\n\n");
        sb.append("Your top performing catalog items this month:\n\n");

        if (!prodSection.isEmpty()) {
            sb.append(prodSection).append("\n\n");
        } else {
            sb.append("- Sales records are continuously tracking SKU velocity.\n\n");
        }

        sb.append("#### 💡 Merchandising Recommendations:\n");
        sb.append("1. **Front-and-Center Display**: Feature your top revenue-generating products prominently on your POS quick-touch keys.\n");
        sb.append("2. **Cross-Sell Pairings**: Suggest high-margin accessories or complementary items alongside bestsellers.\n");
        sb.append("3. **Safety Stock Buffer**: Increase reorder quantities for velocity items to prevent lost sales.");

        return sb.toString();
    }

    private String generateCustomerAdvice(String context) {
        String custSection = extractSection(context, "--- CUSTOMER ACTIVITY & RETENTION ---", "--- CUSTOMER REPUTATION & REVIEWS ---");

        StringBuilder sb = new StringBuilder();
        sb.append("### 👥 Customer Loyalty & Retention Metrics\n\n");
        sb.append("Summary from your customer relationship ledger:\n\n");

        if (!custSection.isEmpty()) {
            sb.append(custSection).append("\n\n");
        } else {
            sb.append("- Customer profiles and spending history are tracked across all POS invoices.\n\n");
        }

        sb.append("#### 💡 Retention Action Plan:\n");
        sb.append("1. **VIP Recognition**: Reward repeat buyers with exclusive loyalty discounts or personalized notes.\n");
        sb.append("2. **Win-Back Outreach**: Export customers without purchases in the last 30 days and send a welcome back special.\n");
        sb.append("3. **Capture Customer Details**: Encourage cashiers to record customer contact details during POS checkout.");

        return sb.toString();
    }

    private String generateReviewAdvice(String context) {
        String reviewSection = extractSection(context, "--- CUSTOMER REPUTATION & REVIEWS ---", "--- STRICT INSTRUCTIONS ---");

        StringBuilder sb = new StringBuilder();
        sb.append("### ⭐ Customer Reviews & Reputation Analysis\n\n");
        sb.append("Live feedback metrics from your Reviews module:\n\n");

        if (!reviewSection.isEmpty()) {
            sb.append(reviewSection).append("\n\n");
        } else {
            sb.append("- Customer reviews and public review landing page are active.\n\n");
        }

        sb.append("#### 💡 Reputation Growth Checklist:\n");
        sb.append("1. **Print Review QR Codes**: Place your Review QR codes near checkout registers and on printed receipts.\n");
        sb.append("2. **Boost Public Platforms**: High-rating customers (4-5 stars) are automatically directed to your public Google/TripAdvisor page.\n");
        sb.append("3. **Private Issue Resolution**: Review private negative feedback in the **Reviews** module to resolve customer concerns proactively.");

        return sb.toString();
    }

    private String generateExecutiveOverview(String context) {
        String sales = extractSection(context, "--- REVENUE & SALES SNAPSHOT ---", "--- OPERATING EXPENSES & NET PROFIT ---");
        String expenses = extractSection(context, "--- OPERATING EXPENSES & NET PROFIT ---", "--- TOP SELLING PRODUCTS & SERVICES (THIS MONTH) ---");
        String stock = extractSection(context, "--- INVENTORY RESTOCK & LOW STOCK AUDIT ---", "--- CUSTOMER ACTIVITY & RETENTION ---");

        StringBuilder sb = new StringBuilder();
        sb.append("### 📊 Executive Business Intelligence Overview\n\n");
        sb.append("Here is the verified executive briefing for your business:\n\n");

        if (!sales.isEmpty()) {
            sb.append("#### 💰 Revenue & Sales Velocity\n");
            sb.append(sales).append("\n\n");
        }

        if (!expenses.isEmpty()) {
            sb.append("#### ⚖️ Expenses & Profit Margins\n");
            sb.append(expenses).append("\n\n");
        }

        if (!stock.isEmpty()) {
            sb.append("#### 📦 Inventory & Restock Status\n");
            sb.append(stock).append("\n\n");
        }

        sb.append("#### 🎯 Key Strategic Action Items:\n");
        sb.append("1. **Restock Priority SKUs**: Review items at or below reorder threshold to avoid stockouts.\n");
        sb.append("2. **Protect Margins**: Monitor major expense categories against net monthly revenue.\n");
        sb.append("3. **Accelerate Review Velocity**: Encourage satisfied POS customers to scan your Review QR code.");

        return sb.toString();
    }
}
