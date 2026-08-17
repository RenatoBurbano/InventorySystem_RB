var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularDevCors",
                      policy => policy
                            .WithOrigins("http://localhost:4200")
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                      );
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();

app.UseRouting();
app.UseCors("AngularDevCors");

app.MapReverseProxy();

app.Run();