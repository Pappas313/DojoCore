using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text.Json.Nodes;
using System.Text.Json;

namespace DojoCore.API.Swagger;

/// <summary>
/// Replaces the default Swagger UI form with proper nested schemas for both
/// multipart/form-data and application/json, with 4 pre-filled scenario examples.
/// </summary>
public class RegisterOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (context.MethodInfo.Name != "Register") return;

        // ── shared nested schema (used by both content types) ──────────────
        var userSchema = new OpenApiSchema
        {
            Type = JsonSchemaType.Object,
            Required = new HashSet<string> { "username", "email", "password", "role" },
            Properties = new Dictionary<string, IOpenApiSchema>
            {
                ["username"]    = S(JsonSchemaType.String),
                ["email"]       = S(JsonSchemaType.String, format: "email"),
                ["password"]    = S(JsonSchemaType.String, format: "password"),
                ["user_code"]   = S(JsonSchemaType.String, description: "Optional. Auto-generated if omitted."),
                ["role"]        = S(JsonSchemaType.Integer, description: "1 = Coach | 2 = Manager | 3 = Athlete",
                                      enums: [JsonValue.Create(1), JsonValue.Create(2), JsonValue.Create(3)]),
                ["address"]     = S(JsonSchemaType.String, description: "Lat/lon resolved automatically from this address"),
                ["gender"]      = S(JsonSchemaType.Integer, description: "0 = Female | 1 = Male",
                                      enums: [JsonValue.Create(0), JsonValue.Create(1)]),
                ["dateOfBirth"] = S(JsonSchemaType.String, format: "date", description: "yyyy-MM-dd"),
            }
        };

        var newGymSchema = new OpenApiSchema
        {
            Type = JsonSchemaType.Object,
            Description = "Required when gymAction = create",
            Properties = new Dictionary<string, IOpenApiSchema>
            {
                ["name"]    = S(JsonSchemaType.String),
                ["address"] = S(JsonSchemaType.String, description: "Lat/lon resolved automatically from this address"),
            }
        };

        var sharedProperties = new Dictionary<string, IOpenApiSchema>
        {
            ["user"]      = userSchema,
            ["gymAction"] = S(JsonSchemaType.String, description: "join | create | none",
                                enums: [JsonValue.Create("join"), JsonValue.Create("create"), JsonValue.Create("none")]),
            ["gymCode"]   = S(JsonSchemaType.String, description: "Required when gymAction = join. E.g. GYM-X7B9Q"),
            ["newGym"]    = newGymSchema,
        };

        // multipart adds files on top
        var formProperties = new Dictionary<string, IOpenApiSchema>(sharedProperties)
        {
            ["files"] = new OpenApiSchema
            {
                Type        = JsonSchemaType.Array,
                Items       = S(JsonSchemaType.String, format: "binary"),
                Description = "Optional file attachments (certificates, IDs, medical documents)"
            }
        };

        // ── shared examples ────────────────────────────────────────────────
        var examples = new Dictionary<string, IOpenApiExample>
        {
            ["Scenario 1 – Athlete joins gym"] = new OpenApiExample
            {
                Summary = "Athlete – Join Existing Gym",
                Value   = JsonNode.Parse("""
                    {
                      "user": {
                        "username": "athlete_john",
                        "email": "john@example.com",
                        "password": "SecurePassword123!",
                        "user_code": "gfgfgfhfgh",
                        "role": 3,
                        "address": "123 Athens St",
                        "gender": 1,
                        "dateOfBirth": "1990-01-01"
                      },
                      "gymAction": "join",
                      "gymCode": "GYM-X7B9Q",
                      "newGym": null
                    }
                    """)
            },
            ["Scenario 2 – Athlete freelancer"] = new OpenApiExample
            {
                Summary = "Athlete – Freelancer (no gym)",
                Value   = JsonNode.Parse("""
                    {
                      "user": {
                        "username": "athlete_jane",
                        "email": "jane@example.com",
                        "password": "SecurePassword123!",
                        "role": 3,
                        "address": "456 Sparta Ave",
                        "gender": 0,
                        "dateOfBirth": "1992-05-15"
                      },
                      "gymAction": "none",
                      "gymCode": null,
                      "newGym": null
                    }
                    """)
            },
            ["Scenario 3 – Coach/Manager joins gym"] = new OpenApiExample
            {
                Summary = "Coach or Manager – Join Existing Gym",
                Value   = JsonNode.Parse("""
                    {
                      "user": {
                        "username": "coach_mike",
                        "email": "mike@example.com",
                        "password": "SecurePassword123!",
                        "role": 1,
                        "address": "789 Crete Blvd",
                        "gender": 1,
                        "dateOfBirth": "1985-11-20"
                      },
                      "gymAction": "join",
                      "gymCode": "GYM-X7B9Q",
                      "newGym": null
                    }
                    """)
            },
            ["Scenario 4 – Manager creates gym"] = new OpenApiExample
            {
                Summary = "Manager – Create New Gym",
                Value   = JsonNode.Parse("""
                    {
                      "user": {
                        "username": "manager_anna",
                        "email": "anna@example.com",
                        "password": "SecurePassword123!",
                        "role": 2,
                        "address": "101 Rhodes St",
                        "gender": 0,
                        "dateOfBirth": "1988-08-08"
                      },
                      "gymAction": "create",
                      "gymCode": null,
                      "newGym": {
                        "name": "Elite Taekwondo Academy",
                        "address": "101 Rhodes St"
                      }
                    }
                    """)
            }
        };

        operation.RequestBody = new OpenApiRequestBody
        {
            Required = true,
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["application/json"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type       = JsonSchemaType.Object,
                        Properties = sharedProperties,
                        Required   = new HashSet<string> { "user", "gymAction" }
                    },
                    Examples = examples
                },
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type       = JsonSchemaType.Object,
                        Properties = formProperties,
                        Required   = new HashSet<string> { "user", "gymAction" }
                    },
                    Encoding = new Dictionary<string, OpenApiEncoding>
                    {
                        ["user"]   = new OpenApiEncoding { Style = ParameterStyle.DeepObject, Explode = true },
                        ["newGym"] = new OpenApiEncoding { Style = ParameterStyle.DeepObject, Explode = true },
                    },
                    Examples = examples
                }
            }
        };
    }

    private static OpenApiSchema S(
        JsonSchemaType type,
        string? format = null,
        string? description = null,
        IList<JsonNode>? enums = null) => new()
    {
        Type        = type,
        Format      = format,
        Description = description,
            Enum = enums
    };
}
