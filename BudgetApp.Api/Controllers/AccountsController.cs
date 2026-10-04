using BudgetApp.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace BudgetApp.Api.Controllers;

[ApiController]
[Route("accounts")]
public class AccountsController : ControllerBase
{
    private readonly BudgetDb db;

    public AccountsController(BudgetDb db)
    {
        this.db = db;
    }

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
}