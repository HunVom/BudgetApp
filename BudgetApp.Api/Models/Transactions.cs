namespace BudgetApp.Api.Models;

public class Transaction
{
    public int Id { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public bool IsDeleted { get; set; }
    public string Note { get; set; } = "";
}

public enum TransactionType
{
    Income,
    Expense
}