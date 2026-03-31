import { useMutation } from "@tanstack/react-query";
import { useAIStore } from "@/stores/ai-store";
import { generateId } from "@/lib/utils";
import type { AIMessage } from "@/types";

export function useAIChat() {
  const { addMessage, setLoading, addTokens, context } = useAIStore();

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      // Add user message
      const userMessage: AIMessage = {
        id: generateId(),
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
        context: context || undefined,
      };
      addMessage(userMessage);
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock AI response based on message content
      let responseContent = "";
      let confidence = 0.85;
      const actions: AIMessage["actions"] = [];

      if (message.toLowerCase().includes("gdpr")) {
        responseContent = `## GDPR Analysis\n\nBased on your query about GDPR, here are the key findings:\n\n**Current Compliance Status**: Your organization is at **87% compliance** with GDPR requirements.\n\n### Key Areas Requiring Attention:\n\n1. **Data Processing Agreements** - 3 vendor DPAs need updating to include standard contractual clauses\n2. **Privacy Impact Assessments** - 2 pending DPIAs for new data processing activities\n3. **Breach Notification** - Response playbook needs annual review (last updated 8 months ago)\n\n### Recommended Actions:\n- Update vendor DPAs by April 15, 2026\n- Complete pending DPIAs before new processing begins\n- Schedule breach response tabletop exercise\n\n*Confidence Score: 92%*`;
        confidence = 0.92;
        actions.push(
          { id: "a1", label: "Create DPIA Task", type: "approve", payload: { action: "create-task", template: "dpia" } },
          { id: "a2", label: "View DPA Status", type: "navigate", payload: { url: "/regulations/1" } }
        );
      } else if (message.toLowerCase().includes("risk")) {
        responseContent = `## Risk Assessment Summary\n\nI've analyzed your current risk landscape:\n\n**Overall Risk Score**: 34/100 (Moderate)\n\n### Top Risk Categories:\n\n| Category | Score | Trend |\n|----------|-------|-------|\n| Data Privacy | 20/25 | Stable |\n| Cybersecurity | 16/25 | Improving |\n| Financial Controls | 12/25 | Stable |\n| Operational | 9/25 | Declining |\n\n### Recommendations:\n1. Prioritize GDPR remediation to reduce data privacy risk\n2. Complete DORA implementation for cybersecurity improvements\n3. Review third-party vendor risk assessments\n\nWould you like me to generate a detailed risk report?`;
        confidence = 0.88;
      } else if (message.toLowerCase().includes("audit")) {
        responseContent = `## Audit Overview\n\nHere's a summary of your audit landscape:\n\n**Active Audits**: 3\n**Upcoming**: 2\n**Open Findings**: 5 (2 Critical, 2 Major, 1 Minor)\n\n### Critical Findings:\n1. **Missing breach notification procedure** - GDPR Audit\n   - Status: In Remediation\n   - Due: March 31, 2026\n\n2. **ICT risk framework incomplete** - DORA Assessment\n   - Status: Open\n   - Recommended: Engage external consultant\n\n### Next Steps:\n- Focus on closing critical findings before Q2\n- Prepare for SOC 2 Type II audit starting May 1`;
        confidence = 0.9;
      } else {
        responseContent = `I can help you with various compliance-related tasks. Here are some things I can assist with:\n\n- **Regulatory Analysis** - Summarize and explain regulations\n- **Risk Assessment** - Analyze and score compliance risks\n- **Audit Preparation** - Review readiness and generate checklists\n- **Policy Drafting** - Draft compliance policies and procedures\n- **Gap Analysis** - Identify compliance gaps across frameworks\n- **Report Generation** - Create executive summaries and board reports\n\nTry asking me about a specific regulation like GDPR, or about your risk posture, audit status, or compliance projects.`;
        confidence = 0.95;
      }

      const aiMessage: AIMessage = {
        id: generateId(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
        confidence,
        actions: actions.length > 0 ? actions : undefined,
      };

      addMessage(aiMessage);
      addTokens(Math.floor(Math.random() * 500) + 200);
      setLoading(false);

      return aiMessage;
    },
  });

  return mutation;
}
