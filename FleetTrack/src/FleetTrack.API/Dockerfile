# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["FleetTrack.sln", "./"]
COPY ["src/FleetTrack.API/FleetTrack.API.csproj", "src/FleetTrack.API/"]
COPY ["src/FleetTrack.Application/FleetTrack.Application.csproj", "src/FleetTrack.Application/"]
COPY ["src/FleetTrack.Domain/FleetTrack.Domain.csproj", "src/FleetTrack.Domain/"]
COPY ["src/FleetTrack.Infrastructure/FleetTrack.Infrastructure.csproj", "src/FleetTrack.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/FleetTrack.API/FleetTrack.API.csproj"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/src/FleetTrack.API"
RUN dotnet build "FleetTrack.API.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "FleetTrack.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 fleettrack && \
    adduser --system --uid 1001 --ingroup fleettrack fleettrack

# Copy published files
COPY --from=publish /app/publish .

# Create data directory for SQLite database
RUN mkdir -p /app/data && \
    chown -R fleettrack:fleettrack /app

# Switch to non-root user
USER fleettrack

# Expose port
EXPOSE 8080

# Environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "FleetTrack.API.dll"]
