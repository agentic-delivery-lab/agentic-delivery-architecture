import com.structurizr.dsl.StructurizrDslParser;
import com.structurizr.inspection.DefaultInspector;
import com.structurizr.util.WorkspaceUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.util.*;

// Repository adapter to unchanged public SDK APIs; never an upstream parser patch.
public class ValidateWorkspace {
    private static final ObjectMapper JSON = new ObjectMapper();

    private static void checkPolicy(JsonNode node) {
        if (node.isObject()) {
            for (var field : node.properties()) {
                String key = field.getKey();
                if (key.startsWith("structurizr.inspection.")) {
                    throw new IllegalArgumentException("Inspection overrides require a reviewed rule profile");
                }
                if (Set.of("themes", "icon", "logo", "imageViews").contains(key)
                        && !field.getValue().isNull()
                        && (field.getValue().isContainerNode() ? !field.getValue().isEmpty() : !field.getValue().asText().isBlank())) {
                    throw new IllegalArgumentException("External themes/images are outside the offline profile: " + key);
                }
                checkPolicy(field.getValue());
            }
        } else if (node.isArray()) {
            node.forEach(ValidateWorkspace::checkPolicy);
        }
    }

    public static void main(String[] args) throws Exception {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("schemaVersion", 1);
        try {
            StructurizrDslParser parser = new StructurizrDslParser();
            for (String feature : List.of("environment", "filesystem", "http", "https", "plugins",
                    "scripts", "componentfinder", "include", "documentation", "decisions")) {
                parser.getFeatures().disable("structurizr.feature.dsl." + feature);
            }
            parser.parse(new File(args[0]));
            var workspace = parser.getWorkspace();
            JsonNode original = JSON.readTree(WorkspaceUtils.toJson(workspace, false));
            checkPolicy(original);
            var restored = WorkspaceUtils.fromJson(WorkspaceUtils.toJson(workspace, false));
            JsonNode roundtrip = JSON.readTree(WorkspaceUtils.toJson(restored, false));
            List<Map<String, String>> findings = new ArrayList<>();
            for (var violation : new DefaultInspector(workspace).getViolations()) {
                findings.add(Map.of("severity", violation.getSeverity().toString(),
                        "rule", violation.getType(), "message", violation.getMessage()));
            }
            result.put("status", "parsed");
            result.put("workspace", original);
            result.put("roundtrip", roundtrip);
            result.put("inspection", Map.of("policy", "advisory", "findings", findings));
        } catch (com.structurizr.dsl.StructurizrDslParserException error) {
            result.put("status", "parse-error");
            result.put("message", error.getMessage());
        } catch (IllegalArgumentException error) {
            result.put("status", "policy-error");
            result.put("message", error.getMessage());
        }
        JSON.writeValue(new File(args[1]), result);
    }
}
