# Sistema de Inventario

# Sistema de gestion de inventario desarrollado como prueba técnica, permite la administración de productos y transacciones con microservicios de por medio, donde se utilizón Yarp para el ApiGateway y comunicación Api Rest (sincrónica).

# Requisitos:
  - Net Core 9
  - Visual Studio
  - Angular 21
  - Node.js v24.14.0
  - Visual Studio Code
  - Sql Server 19
# Ejecución BackEnd
  - Primero clonar del repositorio la solución backend (InventorySystem), para le proyecto se utilizó Net Core 9
  - Revisar los paquetes instalados en cada proyecto, mantener las versiones compatibles con Net 9 (paquetes NuGet) en:
      * ApiGateway
      * Services/ProductService/ProductService.Api
      * Services/TransactionService/ProductService.Api
  - Restaurar las dependencias dotnet restore
  - Ejecutar la solución con VS
  - La aplicación estará disponible en `http://localhost:5000`
# Ejecución FrontEnd
  - clonar del repositorio el proyecto Angular (inventory-system-ui), utilizar Angular 21
  - Instalar las dependencias con npm install
  - Ejecutar el proyecto con ng serve --open
  - Esta disponible en 'http://localhost:4200/'
# Ejecución SQL Server
  - Ejecutar los siguientes Scripts, para tener las bases de datos correspondientes y una data inicial

\`\`\` Product DB

    CREATE DATABASE ProductDb;
    GO
    
    USE ProductDb;
    GO
    
    CREATE TABLE Products (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
    	Category NVARCHAR(100),
    	ImageUrl NVARCHAR(500),
        Price DECIMAL(18,2) NOT NULL,
        Stock INT NOT NULL DEFAULT 0,
    );

    USE ProductDb;
    GO
    
    INSERT INTO Products
    VALUES
    	('Laptop Gaming', 'Laptop utlima gama', 'Tecnología', 'https://laptop.com', 1200.00, 3),
    	('Mouse Gaming', 'Mouse utlima gama', 'Tecnología', 'https://mouse.com', 45.00, 10),
    	('Pantalla Gaming', 'Pantalla utlima gama', 'Tecnología', 'https://pantalla.com', 210.00, 3),
    	('Teclado Gaming', 'Teclado utlima gama', 'Tecnología', 'https://teclado.com', 80.00, 5),
    	('Perifericos Gaming', 'Perifericos utlima gama', 'Tecnología', 'https://perifericos.com', 95.00, 10),
    	('Memoria RAM', 'DDR4 de 8GB', 'Tecnología', 'https://memoria.com', 100.00, 12)
  
\`\`\`


\`\`\` Transaction DB

    CREATE DATABASE TransactionDb;
    GO
    
    USE TransactionDb;
    GO
    
    CREATE TABLE Transactions (
        Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
        TransactionType NVARCHAR(20) NOT NULL,
        ProductId INT NOT NULL,
        Amount INT NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL,
        TotalPrice DECIMAL(18,2) NOT NULL,
        Detail NVARCHAR(500)
    );  
\`\`\`
