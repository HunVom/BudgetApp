using BudgetApp.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.Api.Controllers;

[ApiController]
[Route("transactions")]
public class TransactionsController : ControllerBase
{
    private readonly BudgetDb db;

    public TransactionsController(BudgetDb db)
    {
        this.db = db;
    }

    [HttpPost]
    public IActionResult Create(Transaction transaction)
    {
        db.Transactions.Add(transaction);
        db.SaveChanges();

        return Ok(transaction);
    }

    [HttpGet("balance")]
    public IActionResult GetBalance()
    {
        decimal balance = 0;

        foreach (var transaction in db.Transactions)
        {
            if (transaction.Type == TransactionType.Income)
                balance += transaction.Amount;
            else
                balance -= transaction.Amount;
        }

        return Ok(balance);
    }
}