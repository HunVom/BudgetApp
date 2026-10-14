using BudgetApp.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.Api.Controllers;

[ApiController]
[Route("accounts")]
public class AccountsController(BudgetDb db) : ControllerBase
{
    //private readonly BudgetDb db;

    //public AccountsController(BudgetDb db)
    //{
    //    this.db = db;
    //}

    [HttpPost]
    public IActionResult Create(Account account)
    {
        db.Accounts.Add(account);
        db.SaveChanges();

        return Ok(account);
    }

    [HttpGet]
    public IActionResult GetAccounts()
    {
        var accounts = db.Accounts
            .Where(account => !account.IsDeleted)
            .OrderBy(account => account.Name)
            .ToList();

        return Ok(accounts);
    }

    [HttpGet("all")]
        public IActionResult GetAllAccounts()
        {
            return Ok(db.Accounts
                .OrderBy(account => account.Name)
                .ToList());
        }

    [HttpPut("{id}")]
    public IActionResult Update(int id, Account updatedAccount)
    {
        var account = db.Accounts.Find(id);

        if (account is null || account.IsDeleted)
            return NotFound();

        if (string.IsNullOrWhiteSpace(updatedAccount.Name))
            return BadRequest();

        account.Name = updatedAccount.Name.Trim();

        db.SaveChanges();

        return Ok(account);
    }

    [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var account = db.Accounts.Find(id);

            if (account is null || account.IsDeleted)
                return NotFound();

            
            var balance = db.Transactions
                .Where(t => !t.IsDeleted &&
                    (t.AccountId == id || t.TargetAccountId == id))
                .Sum(t =>
                    t.Type == TransactionType.Transfer
                        ? (t.TargetAccountId == id ? t.Amount : -t.Amount)
                        : (t.Type == TransactionType.Income ? t.Amount : -t.Amount));


            if (balance != 0)
                return BadRequest("A számla egyenlege nem 0. Előbb rendezd az egyenleget!");

            account.IsDeleted = true;
            db.SaveChanges();

            return Ok();
        }

}