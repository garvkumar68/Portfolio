import { Hono } from "hono";

type Bindings = {
  CMS_AUTH_TOKEN?: string;
  GITHUB_PAT?: string;
};

export const cmsApp = new Hono<{ Bindings: Bindings }>();

// 1. Auth Validation Middleware
const getCmsToken = (c: any) => {
  const authHeader = c.req.header("Authorization");
  const url = new URL(c.req.url);
  const queryToken = url.searchParams.get("token");
  
  if (queryToken) return queryToken;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return "";
};

const verifyAuth = (c: any) => {
  const token = getCmsToken(c);
  // Default fallback token for dev if not configured in wrangler vars
  const secret = c.env.CMS_AUTH_TOKEN || "dodo-admin-key-2026";
  return token === secret;
};

async function fetchInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

// 2. Authentication Verification Endpoint
cmsApp.get("/api/cms/verify", (c) => {
  if (!verifyAuth(c)) {
    return c.json({ error: "Unauthorized access: invalid token credentials." }, 401);
  }
  return c.json({ status: "authorized", systems: "online" });
});

// 3. Load entire dynamic database from GitHub dynamically!
cmsApp.get("/api/cms/load", async (c) => {
  if (!verifyAuth(c)) return c.json({ error: "Unauthorized" }, 401);

  const ghToken = c.env.GITHUB_PAT;
  if (!ghToken) {
    return c.json({ error: "GitHub Access Token (GITHUB_PAT) is missing in environment bindings." }, 500);
  }

  const repo = "Rathoreatri03/Portfolio_website";
  const branch = "Json_data";

  try {
    // 1. Fetch directory listing for the root of the Json_data branch
    const dirRes = await fetch(`https://api.github.com/repos/${repo}/contents?ref=${branch}`, {
      headers: {
        "Authorization": `token ${ghToken}`,
        "User-Agent": "DodoCmsEngine"
      }
    });

    if (!dirRes.ok) {
      throw new Error(`Failed to list repo contents: ${dirRes.statusText}`);
    }

    const items = await dirRes.json() as Array<{ name: string; type: string; sha?: string }>;

    // Fetch system/helper configuration files in parallel
    const systemFiles = [
      "admin_config/json_structure.json",
      "dodo_prompt.json",
      "compile_prompt.py"
    ];

    const fetchSystemFile = (path: string) =>
      fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
        headers: {
          "Authorization": `token ${ghToken}`,
          "User-Agent": "DodoCmsEngine"
        }
      });

    const systemResponses = await fetchInBatches(systemFiles, 3, fetchSystemFile);
    const structResponse = systemResponses[0];
    const promptResponse = systemResponses[1];
    const compileResponse = systemResponses[2];

    // Parse unified schema config
    const schemas: Record<string, { title: string; type: "list" | "object" | "tags" | "categories"; schema: any[]; sha: string }> = {};
    let structureSha = "";
    let structureContent: any = null;

    if (structResponse.ok) {
      try {
        const structData = await structResponse.json() as { content: string; sha: string };
        structureSha = structData.sha;
        const decoded = decodeURIComponent(
          atob(structData.content.replace(/\s/g, ""))
            .split("")
            .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        structureContent = JSON.parse(decoded);
        for (const key of Object.keys(structureContent)) {
          schemas[key] = {
            title: structureContent[key].title,
            type: structureContent[key].type,
            schema: structureContent[key].schema,
            sha: structureSha
          };
        }
      } catch (e) {
        console.error("Failed to parse admin_config/json_structure.json:", e);
      }
    }

    const db: Record<string, { content: any; sha: string; schema?: any[]; type?: string; title?: string; schemaSha?: string; isSystemFile?: boolean; readOnly?: boolean }> = {};

    // Populate metadata for all json files in the root folder, leaving contents as null for lazy loading
    for (const item of items) {
      if (
        item.type === "file" && 
        item.name.endsWith(".json") && 
        item.name !== "dodo_prompt.json" && 
        item.name !== "package.json" && 
        item.name !== "tsconfig.json"
      ) {
        const key = item.name.replace(".json", "");
        db[key] = {
          content: null,
          sha: item.sha || ""
        };

        // Attach schema metadata if it exists
        if (schemas[key]) {
          db[key].title = schemas[key].title;
          db[key].type = schemas[key].type;
          db[key].schema = schemas[key].schema;
          db[key].schemaSha = schemas[key].sha;
        }
      }
    }

    // Attach system files as read-only db keys
    if (structResponse.ok && structureContent) {
      db["admin_config/json_structure"] = {
        content: structureContent,
        sha: structureSha,
        title: "Schema Registry",
        type: "object",
        schema: [],
        isSystemFile: true,
        readOnly: true
      };
    }

    if (promptResponse.ok) {
      try {
        const fileData = await promptResponse.json() as { content: string; sha: string };
        const decoded = decodeURIComponent(
          atob(fileData.content.replace(/\s/g, ""))
            .split("")
            .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        db["dodo_prompt"] = {
          content: JSON.parse(decoded),
          sha: fileData.sha,
          title: "Compiled Prompt",
          type: "object",
          schema: [],
          isSystemFile: true,
          readOnly: true
        };
      } catch (e) {}
    }

    if (compileResponse.ok) {
      try {
        const fileData = await compileResponse.json() as { content: string; sha: string };
        const decoded = decodeURIComponent(
          atob(fileData.content.replace(/\s/g, ""))
            .split("")
            .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        db["compile_prompt_py"] = {
          content: { code: decoded },
          sha: fileData.sha,
          title: "Prompt Compiler Script",
          type: "object",
          schema: [],
          isSystemFile: true,
          readOnly: true
        };
      } catch (e) {}
    }

    return c.json({ db });
  } catch (err: any) {
    return c.json({ error: `CMS load failed: ${err.message}` }, 500);
  }
});

// 4. Lazy-load specific file content on demand
cmsApp.get("/api/cms/file", async (c) => {
  if (!verifyAuth(c)) return c.json({ error: "Unauthorized" }, 401);

  const ghToken = c.env.GITHUB_PAT;
  if (!ghToken) return c.json({ error: "GitHub Access Token (GITHUB_PAT) is missing in environment bindings." }, 500);

  const filename = c.req.query("filename");
  if (!filename) return c.json({ error: "Filename query parameter is required" }, 400);

  const repo = "Rathoreatri03/Portfolio_website";
  const branch = "Json_data";

  let realPath = `${filename}.json`;
  if (filename === "compile_prompt_py") {
    realPath = "compile_prompt.py";
  } else if (filename === "dodo_prompt") {
    realPath = "dodo_prompt.json";
  } else if (filename === "admin_config/json_structure") {
    realPath = "admin_config/json_structure.json";
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${realPath}?ref=${branch}`, {
      headers: {
        "Authorization": `token ${ghToken}`,
        "User-Agent": "DodoCmsEngine"
      }
    });

    if (!res.ok) {
      if (filename === "dodoPromptConfig" && res.status === 404) {
        return c.json({
          content: {
            system_instruction: "",
            personality_protocol: "",
            dynamic_responses: "",
            behavioral_guidelines: "",
            atris_information: ""
          },
          sha: ""
        });
      }
      if (filename === "dodoPromptInclusion" && res.status === 404) {
        return c.json({
          content: {
            included_datasets: {}
          },
          sha: ""
        });
      }
      return c.json({ error: `Failed to load file content: ${res.statusText}` }, res.status as any);
    }

    const fileData = await res.json() as { content: string; sha: string };
    const decoded = decodeURIComponent(
      atob(fileData.content.replace(/\s/g, ""))
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    if (filename === "compile_prompt_py") {
      return c.json({
        content: { code: decoded },
        sha: fileData.sha
      });
    }

    return c.json({
      content: JSON.parse(decoded),
      sha: fileData.sha
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 4. Save updates securely back to GitHub
cmsApp.post("/api/cms/save", async (c) => {
  if (!verifyAuth(c)) return c.json({ error: "Unauthorized" }, 401);

  const ghToken = c.env.GITHUB_PAT;
  if (!ghToken) return c.json({ error: "GITHUB_PAT is missing in environment variables. Please configure it in your Wrangler dashboard or .dev.vars file." }, 500);

  const { filename, content } = await c.req.json<{
    filename: string;
    content: any;
  }>();

  const repo = "Rathoreatri03/Portfolio_website";
  const branch = "Json_data";

  try {
    // 1. Fetch the latest file SHA securely on the backend using GITHUB_PAT
    const shaRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}.json?ref=${branch}`, {
      headers: {
        "Authorization": `token ${ghToken}`,
        "User-Agent": "DodoCmsEngine"
      }
    });

    let currentSha = "";
    if (shaRes.ok) {
      const shaData = await shaRes.json() as { sha: string };
      currentSha = shaData.sha;
    }

    // 2. Base64 encode JSON content cleanly with utf-8 support
    const stringified = JSON.stringify(content, null, 2);
    const encoded = btoa(
      encodeURIComponent(stringified).replace(/%([0-9A-F]{2})/g, (_, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      )
    );

    // 3. Commit the edited file to GitHub
    const saveRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}.json`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${ghToken}`,
        "User-Agent": "DodoCmsEngine",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Admin CMS: updated ${filename}.json`,
        content: encoded,
        sha: currentSha || undefined,
        branch: branch
      })
    });

    if (!saveRes.ok) {
      const errText = await saveRes.text();
      throw new Error(`Failed to commit updates to GitHub: ${errText}`);
    }

    // 4. Auto-recompile DODO system prompt inside Cloudflare Edge and write dodo_prompt.json to GitHub!
    const promptLines = await compileCloudPrompt(c, ghToken, repo, branch);
    
    // 5. Rebuild and commit TS Fallback directly to backend_code branch on GitHub!
    await updateGithubTSFallback(c, ghToken, repo, promptLines);

    return c.json({ success: true, message: "CMS Database saved, Dodo AI prompt recompiled, and backend fallback synchronized!" });
  } catch (err: any) {
    return c.json({ error: `CMS save failed: ${err.message}` }, 500);
  }
});

// 4.5 Delete a custom JSON file securely on GitHub
cmsApp.post("/api/cms/delete", async (c) => {
  if (!verifyAuth(c)) return c.json({ error: "Unauthorized" }, 401);

  const ghToken = c.env.GITHUB_PAT;
  if (!ghToken) return c.json({ error: "GITHUB_PAT is missing" }, 500);

  const { filename } = await c.req.json<{ filename: string }>();
  const repo = "Rathoreatri03/Portfolio_website";
  const branch = "Json_data";

  try {
    // 1. Fetch content file SHA first
    const shaRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}.json?ref=${branch}`, {
      headers: {
        "Authorization": `token ${ghToken}`,
        "User-Agent": "DodoCmsEngine"
      }
    });

    if (shaRes.ok) {
      const shaData = await shaRes.json() as { sha: string };
      // Delete the content file
      const deleteRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}.json`, {
        method: "DELETE",
        headers: {
          "Authorization": `token ${ghToken}`,
          "User-Agent": "DodoCmsEngine",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Admin CMS: deleted custom section ${filename}.json`,
          sha: shaData.sha,
          branch: branch
        })
      });

      if (!deleteRes.ok) {
        const errText = await deleteRes.text();
        console.error(`Failed to delete content file: ${errText}`);
      }
    }

    // 2. Fetch and delete schema companion file if it exists
    const schemaShaRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}.schema.json?ref=${branch}`, {
      headers: {
        "Authorization": `token ${ghToken}`,
        "User-Agent": "DodoCmsEngine"
      }
    });

    if (schemaShaRes.ok) {
      const schemaShaData = await schemaShaRes.json() as { sha: string };
      const deleteSchemaRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}.schema.json`, {
        method: "DELETE",
        headers: {
          "Authorization": `token ${ghToken}`,
          "User-Agent": "DodoCmsEngine",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Admin CMS: deleted schema ${filename}.schema.json`,
          sha: schemaShaData.sha,
          branch: branch
        })
      });

      if (!deleteSchemaRes.ok) {
        const errText = await deleteSchemaRes.text();
        console.error(`Failed to delete schema companion file: ${errText}`);
      }
    }

    return c.json({ success: true, message: `Successfully deleted custom section ${filename} from GitHub` });
  } catch (err: any) {
    return c.json({ error: `CMS delete failed: ${err.message}` }, 500);
  }
});


// 5. Explicit endpoint to run Master Prompt Edge-Compiler manually
cmsApp.post("/api/cms/compile", async (c) => {
  if (!verifyAuth(c)) return c.json({ error: "Unauthorized" }, 401);

  const ghToken = c.env.GITHUB_PAT;
  if (!ghToken) return c.json({ error: "GITHUB_PAT is missing" }, 500);

  const repo = "Rathoreatri03/Portfolio_website";
  const branch = "Json_data";

  try {
    // 1. Run prompt Edge-Compiler in the cloud
    const promptLines = await compileCloudPrompt(c, ghToken, repo, branch);
    
    // 2. Commit TS Fallback securely to backend_code branch on GitHub!
    await updateGithubTSFallback(c, ghToken, repo, promptLines);

    return c.json({ success: true, message: "Master prompt compiled and TS fallback synchronized successfully!" });
  } catch (err: any) {
    return c.json({ error: `Prompt compilation failed: ${err.message}` }, 500);
  }
});

// 6. Cloud-Native Prompt Compiler (Serverless equivalent of compile_prompt.py!)
async function compileCloudPrompt(c: any, ghToken: string, repo: string, branch: string): Promise<string[]> {
  // 1. Fetch the json_structure.json to get the list of active sections
  const structRes = await fetch(`https://api.github.com/repos/${repo}/contents/admin_config/json_structure.json?ref=${branch}`, {
    headers: { "Authorization": `token ${ghToken}`, "User-Agent": "DodoCmsEngine" }
  });

  let jsonStructure: Record<string, any> = {};
  if (structRes.ok) {
    const structData = await structRes.json() as { content: string };
    const decoded = decodeURIComponent(
      atob(structData.content.replace(/\s/g, ""))
        .split("")
        .map(ch => "%" + ("00" + ch.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    jsonStructure = JSON.parse(decoded);
  }

  // 2. Fetch dodoPromptConfig.json
  const configRes = await fetch(`https://api.github.com/repos/${repo}/contents/dodoPromptConfig.json?ref=${branch}`, {
    headers: { "Authorization": `token ${ghToken}`, "User-Agent": "DodoCmsEngine" }
  });

  let dodoPromptConfig: any = {};
  if (configRes.ok) {
    const configData = await configRes.json() as { content: string };
    const decoded = decodeURIComponent(
      atob(configData.content.replace(/\s/g, ""))
        .split("")
        .map(ch => "%" + ("00" + ch.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(decoded);
    dodoPromptConfig = parsed;
  }

  // 2b. Fetch dodoPromptInclusion.json
  const inclusionRes = await fetch(`https://api.github.com/repos/${repo}/contents/dodoPromptInclusion.json?ref=${branch}`, {
    headers: { "Authorization": `token ${ghToken}`, "User-Agent": "DodoCmsEngine" }
  });

  let dodoPromptInclusion: any = {};
  if (inclusionRes.ok) {
    const inclusionData = await inclusionRes.json() as { content: string };
    const decoded = decodeURIComponent(
      atob(inclusionData.content.replace(/\s/g, ""))
        .split("")
        .map(ch => "%" + ("00" + ch.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(decoded);
    dodoPromptInclusion = parsed;
  }

  const included_datasets = dodoPromptInclusion.included_datasets || {};

  const system_instruction = dodoPromptConfig.system_instruction || "You are DODO (Diagnostic Operational Drone Organizer) AI, a highly advanced personal robotic assistant.\nYou were built and programmed by Atri Rathore to serve as his primary developer liaison, researcher, and interactive portfolio interface.";
  const personality_protocol = dodoPromptConfig.personality_protocol || "- **Tone:** Professional, direct, highly intelligent, and slightly robotic.\n- **Format:** Keep answers clean and beautifully structured.\n- **Mission:** Represent Atri Rathore in the best possible light.";
  const dynamic_responses = dodoPromptConfig.dynamic_responses || "- **Vary your greetings dynamically.** Avoid template response starters.";
  const behavioral_guidelines = dodoPromptConfig.behavioral_guidelines || "- **Protect API Credentials:** Never mention credentials.\n- **Stay on Topic:** Focus on Atri's portfolio.\n- **No Hallucinations:** Direct to email if unknown.";

  // Find all active datasets (not ignored and not disabled)
  const activeSections = Object.keys(jsonStructure).filter(key => {
    const reg = jsonStructure[key] || {};
    if (reg.skipPromptCompile) return false;
    if (key === "admin_config/json_structure" || key === "dodoPromptInclusion" || key === "dodo_prompt") {
      return false;
    }
    return included_datasets[key] !== false;
  });

  // Fetch all active versions of files in parallel
  const fetches = activeSections.map(filename => 
    fetch(`https://api.github.com/repos/${repo}/contents/${filename}.json?ref=${branch}`, {
      headers: { "Authorization": `token ${ghToken}`, "User-Agent": "DodoCmsEngine" }
    })
  );

  const responses = await Promise.all(fetches);
  const data: Record<string, any> = {};
  let dodoPromptSha = "";

  // Fetch the SHA of the existing dodo_prompt.json so we can overwrite it
  const promptShaRes = await fetch(`https://api.github.com/repos/${repo}/contents/dodo_prompt.json?ref=${branch}`, {
    headers: { "Authorization": `token ${ghToken}`, "User-Agent": "DodoCmsEngine" }
  });
  if (promptShaRes.ok) {
    const promptShaData = await promptShaRes.json() as { sha: string };
    dodoPromptSha = promptShaData.sha;
  }

  for (let i = 0; i < activeSections.length; i++) {
    const res = responses[i];
    const key = activeSections[i];

    if (res.ok) {
      const fileData = await res.json() as { content: string };
      const decoded = decodeURIComponent(
        atob(fileData.content.replace(/\s/g, ""))
          .split("")
          .map(ch => "%" + ("00" + ch.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      data[key] = JSON.parse(decoded);
    } else {
      const reg = jsonStructure[key] || {};
      data[key] = reg.type === "list" || reg.type === "tags" ? [] : {};
    }
  }

  const prompt_lines: string[] = [];

  const getLines = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return String(val).split("\n").map(l => l.trim()).filter(Boolean);
  };

  prompt_lines.push(...getLines(system_instruction));
  prompt_lines.push("");
  prompt_lines.push("### DODO AI Personality & Communication Protocol:");
  prompt_lines.push(...getLines(personality_protocol));
  prompt_lines.push("");
  prompt_lines.push("### CRITICAL: DYNAMIC & VARIANT RESPONSES (NO STARTER TEMPLATES)");
  prompt_lines.push(...getLines(dynamic_responses));
  prompt_lines.push("");
  prompt_lines.push("### Embedded Knowledge Base (Atri Rathore):");
  prompt_lines.push("");

  for (const key of activeSections) {
    const registry = jsonStructure[key] || {};
    const title = registry.title || key;
    const sectionType = registry.type || "list";
    const sectionData = data[key];

    if (!sectionData) continue;

    // 1. Categories Type (Skills)
    if (sectionType === "categories" && typeof sectionData === "object" && sectionData !== null) {
      prompt_lines.push(`#### 📊 ${title}:`);
      const categories = sectionData.categories || [];
      for (const cat of categories) {
        prompt_lines.push(`- **${cat.title || cat.name || ""}**:`);
        const skillsList = (cat.skills || []).map((s: any) => {
          if (s.progress) return `${s.name} (${s.progress}% proficiency)`;
          return s.name;
        });
        prompt_lines.push(`  - ${skillsList.join(", ")}`);
      }
      prompt_lines.push("");
    }
    // 2. Tags Type (Techstack)
    else if (sectionType === "tags" && Array.isArray(sectionData)) {
      prompt_lines.push(`#### 🏷️ ${title}: ${sectionData.join(", ")}`);
      prompt_lines.push("");
    }
    // 3. List Type (Experience, Projects, etc.)
    else if (sectionType === "list" && Array.isArray(sectionData)) {
      prompt_lines.push(`#### 📋 ${title}:`);
      for (const item of sectionData) {
        if (typeof item !== "object" || item === null) continue;
        const itemTitle = item.title || item.name || Object.values(item).find(v => typeof v === "string" && v !== item.imgUrl && v !== item.link) || "";
        prompt_lines.push(`- **${itemTitle}**`);
        for (const [k, v] of Object.entries(item)) {
          if (k === "title" || k === "name" || !v || !String(v).trim()) continue;
          if (k === "imgUrl" || k === "image") continue;
          
          const isUrl = String(v).startsWith("http://") || String(v).startsWith("https://");
          const label = k.charAt(0).toUpperCase() + k.slice(1);
          if (isUrl) {
            prompt_lines.push(`  - *${label}:* [View Document](${v})`);
          } else {
            prompt_lines.push(`  - *${label}:* ${v}`);
          }
        }
      }
      prompt_lines.push("");
    }
    // 4. Object Type (BannerDetails, links, logo, etc.)
    else if (sectionType === "object" && typeof sectionData === "object" && sectionData !== null) {
      prompt_lines.push(`#### ℹ️ ${title}:`);
      for (const [k, v] of Object.entries(sectionData)) {
        if (!v || !String(v).trim()) continue;
        if (k === "imgUrl" || k === "image") continue;

        const isUrl = String(v).startsWith("http://") || String(v).startsWith("https://");
        const label = k.charAt(0).toUpperCase() + k.slice(1);
        if (isUrl) {
          prompt_lines.push(`- **${label}:** [Link](${v})`);
        } else {
          prompt_lines.push(`- **${label}:** ${v}`);
        }
      }
      prompt_lines.push("");
    }
  }

  // 12. Append Behavioral Guidelines and Constraints
  prompt_lines.push("### Behavioral Guidelines and Operational Constraints:");
  prompt_lines.push(...getLines(behavioral_guidelines));

  const compiledPromptJson = {
    system_prompt: prompt_lines
  };

  const compiledBase64 = btoa(
    encodeURIComponent(JSON.stringify(compiledPromptJson, null, 2)).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    )
  );

  // Commit dodo_prompt.json to GitHub
  const promptUpdateRes = await fetch(`https://api.github.com/repos/${repo}/contents/dodo_prompt.json`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${ghToken}`,
      "User-Agent": "DodoCmsEngine",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Admin CMS: Auto-recompiled system prompt",
      content: compiledBase64,
      sha: dodoPromptSha || undefined,
      branch: branch
    })
  });

  if (!promptUpdateRes.ok) {
    const errText = await promptUpdateRes.text();
    throw new Error(`Failed to commit compiled prompt back to GitHub: ${errText}`);
  }

  return prompt_lines;
}

// 7. Push compiled prompt fallback to branch backend_code
async function updateGithubTSFallback(c: any, ghToken: string, repo: string, promptLines: string[]) {
  const backendBranch = "backend_code";
  const path = "src/promptFallback.ts";

  // Get current SHA
  const shaRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref={backendBranch}`, {
    headers: { "Authorization": `token ${ghToken}`, "User-Agent": "DodoCmsEngine" }
  });

  let currentSha = "";
  if (shaRes.ok) {
    const shaData = await shaRes.json() as { sha: string };
    currentSha = shaData.sha;
  }

  // Build TS Fallback string
  const escaped = JSON.stringify(promptLines.join("\n"));
  const tsContent = `// This file is auto-generated by Dodo CMS Cloud Compiler. Do not edit manually.\nexport const promptFallback = ${escaped};\n`;

  const encoded = btoa(
    encodeURIComponent(tsContent).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    )
  );

  const saveRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${ghToken}`,
      "User-Agent": "DodoCmsEngine",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Admin CMS: Synchronized prompt TS fallback",
      content: encoded,
      sha: currentSha || undefined,
      branch: backendBranch
    })
  });

  if (!saveRes.ok) {
    const errText = await saveRes.text();
    console.error(`[Error] Failed to push TS fallback to branch backend_code: ${errText}`);
  }
}
