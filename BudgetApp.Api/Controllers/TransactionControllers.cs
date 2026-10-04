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

    [HttpPut("{id}")]
    public IActionResult Update(int id, Transaction updatedTransaction)
    {
        var transaction = db.Transactions.Find(id);

        if (transaction == null || transaction.IsDeleted)
            return NotFound();

        transaction.Type = updatedTransaction.Type;
        transaction.Amount = updatedTransaction.Amount;
        transaction.Date = updatedTransaction.Date;
        transaction.Note = updatedTransaction.Note;

        transaction.AccountId = updatedTransaction.AccountId;

        db.SaveChanges();

        return Ok(transaction);
    }

    [HttpGet("balance")]
    public IActionResult GetBalance()
    {
        decimal balance = 0;

        foreach (var transaction in db.Transactions.Where(transaction => !transaction.IsDeleted))
        {
            if (transaction.Type == TransactionType.Income)
                balance += transaction.Amount;
            else
                balance -= transaction.Amount;
        }

        return Ok(balance);
    }

    [HttpGet("balance/{accountId}")]
    public IActionResult GetAccountBalance(int accountId)
    {
        decimal balance = 0;

        foreach (var transaction in db.Transactions.Where(transaction =>
            !transaction.IsDeleted && transaction.AccountId == accountId))
        {
            if (transaction.Type == TransactionType.Income)
                balance += transaction.Amount;
            else
                balance -= transaction.Amount;
        }

        return Ok(balance);
    }

    [HttpGet]
    public IActionResult GetTransactions()
    {
        var transactions = db.Transactions
        .Where(transaction => !transaction.IsDeleted)
        .OrderByDescending(transaction => transaction.Id)
        .Take(100)
        .ToList();

        return Ok(transactions);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var transaction = db.Transactions.Find(id);

        if (transaction == null)
            return NotFound();

        transaction.IsDeleted = true;
        db.SaveChanges();

        return Ok();
    }
}