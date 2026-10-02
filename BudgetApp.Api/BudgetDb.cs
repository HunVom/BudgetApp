using BudgetApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetApp.Api;

public class BudgetDb : DbContext
{
    public BudgetDb(DbContextOptions<BudgetDb> options) : base(options) { }

    public DbSet<Transaction> Transactions { get; set; }
}