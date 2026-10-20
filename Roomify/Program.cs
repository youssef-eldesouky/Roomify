using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Roomify.Data;
using Roomify.Mapping;
using Roomify.Utilities;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var configuration = builder.Configuration;

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Use camelCase JSON so frontend fields (token, refreshToken, etc.) match
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
    options.EnableSensitiveDataLogging(); // Enable detailed logging for debugging
    options.EnableDetailedErrors(); // Enable detailed error messages
});

// AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// Utilities
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

// minimal CORS for dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

// JWT Auth
var jwtSecret = configuration["Jwt:Secret"] ?? "dev-secret-please-change";
var key = Encoding.ASCII.GetBytes(jwtSecret);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateLifetime = true
    };
});

// Services
builder.Services.AddHealthChecks();
builder.Services.AddScoped<Roomify.Services.Interfaces.IAuthService, Roomify.Services.Implementations.AuthService>();
builder.Services.AddScoped<Roomify.Services.Interfaces.IListingService, Roomify.Services.Implementations.ListingService>();
builder.Services.AddScoped<Roomify.Services.Interfaces.IBookingService, Roomify.Services.Implementations.BookingService>();
builder.Services.AddScoped<Roomify.Services.Interfaces.IAvailabilityService, Roomify.Services.Implementations.AvailabilityService>();
builder.Services.AddScoped<Roomify.Services.Interfaces.IFileStorageService, Roomify.Services.Implementations.LocalFileStorageService>();
// background hosted service
builder.Services.AddHostedService<Roomify.Services.Background.HoldExpiryService>();
var app = builder.Build();

// Ensure DB created & seed
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = services.GetRequiredService<ApplicationDbContext>();
        
        logger.LogInformation("Applying database migrations...");
        db.Database.Migrate(); // apply migrations on startup (dev convenience)
        logger.LogInformation("Database migrations applied successfully.");
        
        logger.LogInformation("Seeding database...");
        await DbInitializer.EnsureSeedDataAsync(db, services);
        logger.LogInformation("Database seeding completed.");
        
        // Verify database connection
        var userCount = await db.Users.CountAsync();
        logger.LogInformation($"Database connection verified. Current user count: {userCount}");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        logger.LogError($"Error details: {ex.Message}");
        if (ex.InnerException != null)
        {
            logger.LogError($"Inner exception: {ex.InnerException.Message}");
        }
        // Don't stop the app, but log the error
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapHealthChecks("/health");
app.UseCors("AllowAll");
app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Default route - serve frontend index.html
app.MapGet("/", () => Results.Redirect("/Roomify-Frontend/Home Page/index.html"));

app.Run();
