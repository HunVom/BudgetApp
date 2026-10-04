namespace BudgetApp.Api.Models;

public class Account
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public bool IsDeleted { get; set; }
}