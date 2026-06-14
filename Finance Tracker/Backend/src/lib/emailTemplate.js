function emailTemplate({userName, type, data}) {
    if (type === "monthly-report") {
        return `
      <div style="background-color: #f6f9fc; font-family: -apple-system, sans-serif; padding: 20px;">
        <div style="background-color: #ffffff; margin: 0 auto; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px;">
          
          <h1 style="color: #1f2937; font-size: 32px; font-weight: bold; text-align: center; margin: 0 0 20px;">Monthly Financial Report</h1>
          
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 16px;">Hello ${userName},</p>
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 16px;">Here's your financial summary for ${data?.month}:</p>

          <!-- Main Stats -->
          <div style="margin: 32px 0; padding: 20px; background-color: #f9fafb; border-radius: 5px;">
            <div style="margin-bottom: 16px; padding: 12px; background-color: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <p style="color: #4b5563; font-size: 16px; margin: 0 0 8px;">Total Income</p>
              <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0;">₹${data?.stats?.totalIncome}</p>
            </div>
            <div style="margin-bottom: 16px; padding: 12px; background-color: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <p style="color: #4b5563; font-size: 16px; margin: 0 0 8px;">Total Expenses</p>
              <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0;">₹${data?.stats?.totalExpenses}</p>
            </div>
            <div style="margin-bottom: 16px; padding: 12px; background-color: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <p style="color: #4b5563; font-size: 16px; margin: 0 0 8px;">Net</p>
              <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0;">₹${data?.stats?.totalIncome - data?.stats?.totalExpenses}</p>
            </div>
          </div>

          <!-- Category Breakdown -->
          ${
              data?.stats?.byCategory
                  ? `
            <div style="margin-top: 32px; padding: 20px; background-color: #f9fafb; border-radius: 5px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Expenses by Category</h2>
              ${Object.entries(data.stats.byCategory)
                  .map(
                      ([category, amount]) => `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <p style="color: #4b5563; font-size: 16px; margin: 0;">${category}</p>
                  <p style="color: #4b5563; font-size: 16px; margin: 0;">₹${amount}</p>
                </div>
              `,
                  )
                  .join("")}
            </div>
          `
                  : ""
          }

          <!-- AI Insights -->
          ${
              data?.insights
                  ? `
            <div style="margin-top: 32px; padding: 20px; background-color: #f9fafb; border-radius: 5px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Wealth Insights</h2>
              ${data.insights
                  .map(
                      (insight) => `
                <p style="color: #4b5563; font-size: 16px; margin: 0 0 16px;">• ${insight}</p>
              `,
                  )
                  .join("")}
            </div>
          `
                  : ""
          }

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            Thank you for using Wealthwise. Keep tracking your finances for better financial health!
          </p>
        </div>
      </div>
    `;
    }

    if (type === "budget-alert") {
        return `
      <div style="background-color: #f6f9fc; font-family: -apple-system, sans-serif; padding: 20px;">
        <div style="background-color: #ffffff; margin: 0 auto; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px;">
          
          <h1 style="color: #1f2937; font-size: 32px; font-weight: bold; text-align: center; margin: 0 0 20px;">Budget Alert</h1>
          
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 16px;">Hello ${userName},</p>
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 16px;">
            You've used <strong>${data?.percentageUsed.toFixed(1)}%</strong> of your monthly budget.
          </p>

          <div style="margin: 32px 0; padding: 20px; background-color: #f9fafb; border-radius: 5px;">
            <div style="margin-bottom: 16px; padding: 12px; background-color: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <p style="color: #4b5563; font-size: 16px; margin: 0 0 8px;">Budget Amount</p>
              <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0;">₹${data?.budgetAmount}</p>
            </div>
            <div style="margin-bottom: 16px; padding: 12px; background-color: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <p style="color: #4b5563; font-size: 16px; margin: 0 0 8px;">Spent So Far</p>
              <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0;">₹${data?.totalExpenses}</p>
            </div>
            <div style="margin-bottom: 16px; padding: 12px; background-color: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <p style="color: #4b5563; font-size: 16px; margin: 0 0 8px;">Remaining</p>
              <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0;">₹${data?.budgetAmount - data?.totalExpenses}</p>
            </div>
          </div>

        </div>
      </div>
    `;
    }
}

module.exports = {emailTemplate};
