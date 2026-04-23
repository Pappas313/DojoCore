using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text.Json.Nodes;

namespace DojoCore.API.Swagger;

/// <summary>
/// Replaces the default JSON request body for the Login endpoint with a
/// multipart/form-data schema so it can be tested directly from Swagger UI.
/// </summary>
public class LoginOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (context.MethodInfo.Name != "Login") return;

        var schema = new OpenApiSchema
        {
            Type       = JsonSchemaType.Object,
            Properties = new Dictionary<string, IOpenApiSchema>
            {
                ["identifier"] = new OpenApiSchema
                {
                    Type        = JsonSchemaType.String,
                    Description = "Email address or username"
                },
                ["password"] = new OpenApiSchema
                {
                    Type   = JsonSchemaType.String,
                    Format = "password"
                }
            },
            Required = new HashSet<string> { "identifier", "password" }
        };

        operation.RequestBody = new OpenApiRequestBody
        {
            Required = true,
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType { Schema = schema },
                ["application/json"]    = new OpenApiMediaType { Schema = schema }
            }
        };
    }
}
