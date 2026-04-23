using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text.Json.Nodes;

namespace DojoCore.API.Swagger;

/// <summary>
/// Replaces the raw "payload" string field in Swagger UI with all the actual
/// register request fields (user.*, gymAction, gymCode, newGym.*) plus files,
/// so the endpoint is fully testable from the Swagger UI.
/// </summary>
public class RegisterOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (context.MethodInfo.Name != "Register") return;

        var properties = new Dictionary<string, IOpenApiSchema>
        {
            // ── user ──────────────────────────────────────────────────────────
            ["user[username]"]    = S(JsonSchemaType.String),
            ["user[email]"]       = S(JsonSchemaType.String, format: "email"),
            ["user[password]"]    = S(JsonSchemaType.String, format: "password"),
            ["user[user_code]"]   = S(JsonSchemaType.String, description: "Optional. Auto-generated if omitted."),
            ["user[role]"]        = S(JsonSchemaType.Integer, description: "1 = Coach | 2 = Manager | 3 = Athlete",
                                        enums: [JsonValue.Create(1), JsonValue.Create(2), JsonValue.Create(3)]),
            ["user[address]"]     = S(JsonSchemaType.String, description: "Latitude & longitude will be resolved automatically from this address"),
            ["user[gender]"]      = S(JsonSchemaType.Integer, description: "0 = Female | 1 = Male",
                                        enums: [JsonValue.Create(0), JsonValue.Create(1)]),
            ["user[dateOfBirth]"] = S(JsonSchemaType.String, format: "date", description: "Format: yyyy-MM-dd"),

            // ── gym ───────────────────────────────────────────────────────────
            ["gymAction"] = S(JsonSchemaType.String, description: "join | create | none",
                                enums: [JsonValue.Create("join"), JsonValue.Create("create"), JsonValue.Create("none")]),
            ["gymCode"]   = S(JsonSchemaType.String, description: "Required when gymAction = join. E.g. GYM-X7B9Q"),

            // ── newGym (used when gymAction = "create") ───────────────────────
            ["newGym[name]"]    = S(JsonSchemaType.String, description: "Required when gymAction = create"),
            ["newGym[address]"] = S(JsonSchemaType.String, description: "Latitude & longitude will be resolved automatically from this address"),

            // ── files ─────────────────────────────────────────────────────────
            ["files"] = new OpenApiSchema
            {
                Type        = JsonSchemaType.Array,
                Items       = S(JsonSchemaType.String, format: "binary"),
                Description = "Optional file attachments (certificates, IDs, medical documents)"
            }
        };

        operation.RequestBody = new OpenApiRequestBody
        {
            Required = true,
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type       = JsonSchemaType.Object,
                        Properties = properties,
                        Required   = new HashSet<string>
                        {
                            "user[username]", "user[email]", "user[password]", "user[role]", "gymAction"
                        }
                    }
                }
            }
        };
    }

    private static OpenApiSchema S(
        JsonSchemaType type,
        string? format = null,
        string? description = null,
        List<JsonNode?>? enums = null) => new()
    {
        Type        = type,
        Format      = format,
        Description = description,
        Enum        = enums
    };
}
