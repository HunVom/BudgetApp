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
        if (transaction.Amount < 0.01m)
        return BadRequest();

        var account = db.Accounts.Find(transaction.AccountId);

        if (account is null || account.IsDeleted)
        return BadRequest("A kiválasztott számla nem létezik vagy már törölve lett.");

        db.Transactions.Add(transaction);
        db.SaveChanges();

        return Ok(transaction);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, Transaction updatedTransaction)
    {
        var transaction = db.Transactions.Find(id);

        if (transaction is null || transaction.IsDeleted)
        return NotFound();

        if (updatedTransaction.Amount < 0.01m)
        return BadRequest();

        var account = db.Accounts.Find(updatedTransaction.AccountId);
        if (account is null || account.IsDeleted)
        return BadRequest("A kiválasztott számla nem létezik vagy már törölve lett.");    

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
        var balance = db.Transactions
            .Where(transaction => !transaction.IsDeleted)
            .Sum(transaction =>
                transaction.Type == TransactionType.Income
                    ? transaction.Amount
                    : -transaction.Amount);

        return Ok(balance);
    }

    [HttpGet("balance/{accountId}")]
    public IActionResult GetAccountBalance(int accountId)
    {
        var balance = db.Transactions
            .Where(transaction =>
                !transaction.IsDeleted && transaction.AccountId == accountId)
            .Sum(transaction =>
                transaction.Type == TransactionType.Income
                    ? transaction.Amount
                    : -transaction.Amount);

        return Ok(balance);
    }

    [HttpGet]
    public IActionResult GetTransactions(int from = 0, int to = 100)
    {
        List<Transaction> transactions = db.Transactions
        .Where(transaction => !transaction.IsDeleted)
        .OrderByDescending(transaction => transaction.Id)
        .Skip(from)
        .Take(to)
        .ToList();

        return Ok(transactions);
    }

    [HttpGet("count")]
    public IActionResult GetTransactionCount()
    {
        return Ok(db.Transactions.Count(t => !t.IsDeleted));
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