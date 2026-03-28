using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NLC.Infrastructure.Data;

public class NlcDbContextFactory : IDesignTimeDbContextFactory<NlcDbContext>
{
    public NlcDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<NlcDbContext>()
            .UseNpgsql("Host=localhost;Database=nlc_jobcards;Username=postgres;Password=postgres")
            .Options;
        return new NlcDbContext(options);
    }
}
