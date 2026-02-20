FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["CryptoApi.csproj", "./"]
RUN dotnet restore "./CryptoApi.csproj"

COPY . ./
RUN dotnet publish "./CryptoApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

COPY --from=build /app/publish ./
ENTRYPOINT ["dotnet", "CryptoApi.dll"]