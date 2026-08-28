/**
 * Campaign & Asset Export Service
 * Packages single assets and multi-deliverable project campaigns into clean, sanitized downloadable bundles.
 */
class ExportService {
  packageProjectCampaign({ project, brief, brandKit, assets = [] }) {
    const timestamp = new Date().toISOString();
    const projectName = project?.name || 'CreateForge-Campaign';
    const cleanSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // 1. Structured JSON Bundle
    const jsonBundle = {
      product: 'CreateForge AI',
      version: '2.0.0',
      exportedAt: timestamp,
      project: {
        id: project?._id || project?.id,
        name: project?.name,
        description: project?.description,
        category: project?.category,
        completionPercentage: project?.completionPercentage || 100,
      },
      brandIdentity: brandKit
        ? {
            brandName: brandKit.brandName,
            tagline: brandKit.tagline,
            toneOfVoice: brandKit.toneOfVoice,
            targetAudience: brandKit.targetAudience,
            colors: brandKit.colors,
          }
        : null,
      creativeBrief: brief
        ? {
            campaignObjective: brief.campaignObjective,
            targetAudience: brief.targetAudience,
            contentGoal: brief.contentGoal,
            keywords: brief.keywords,
            visualDirection: brief.visualDirection,
            requiredDeliverables: brief.requiredDeliverables,
          }
        : null,
      deliverables: assets.map((a) => ({
        type: a.assetType,
        title: a.title,
        content: a.content,
        previewUrl: a.previewUrl,
        createdAt: a.createdAt,
      })),
    };

    // 2. Comprehensive Master Markdown Document
    let masterMarkdown = `# ${projectName} — Campaign Production Blueprint\n\n`;
    masterMarkdown += `*Generated with CreateForge AI on ${new Date().toLocaleDateString()}*\n\n`;
    masterMarkdown += `---\n\n`;

    if (brief) {
      masterMarkdown += `## 📋 Creative Campaign Brief\n\n`;
      masterMarkdown += `**Objective:** ${brief.campaignObjective}\n\n`;
      masterMarkdown += `**Target Audience:** ${brief.targetAudience}\n\n`;
      masterMarkdown += `**Industry & Goal:** ${brief.industry || 'Tech'} — ${brief.contentGoal || 'Awareness'}\n\n`;
      if (brief.keywords?.length) {
        masterMarkdown += `**Target Keywords:** ${brief.keywords.join(', ')}\n\n`;
      }
      masterMarkdown += `---\n\n`;
    }

    if (brandKit) {
      masterMarkdown += `## 🎨 Brand Voice & Guidelines\n\n`;
      masterMarkdown += `**Brand Name:** ${brandKit.brandName || 'N/A'}\n\n`;
      masterMarkdown += `**Tone of Voice:** ${brandKit.toneOfVoice || 'Visionary'}\n\n`;
      if (brandKit.colors?.primary) {
        masterMarkdown += `**Palette:** Primary: \`${brandKit.colors.primary}\`, Secondary: \`${brandKit.colors.secondary}\`, Accent: \`${brandKit.colors.accent}\`\n\n`;
      }
      masterMarkdown += `---\n\n`;
    }

    // Deliverables Sections
    const articles = assets.filter((a) => a.assetType === 'article');
    const images = assets.filter((a) => a.assetType === 'image');
    const socials = assets.filter((a) => a.assetType === 'social' || a.assetType === 'content-pack');
    const titles = assets.filter((a) => a.assetType === 'title');

    if (articles.length > 0) {
      masterMarkdown += `## 📝 Editorial Articles\n\n`;
      articles.forEach((art, idx) => {
        masterMarkdown += `### ${idx + 1}. ${art.title}\n\n`;
        masterMarkdown += typeof art.content === 'string' ? `${art.content}\n\n` : `\n\n`;
      });
      masterMarkdown += `---\n\n`;
    }

    if (socials.length > 0) {
      masterMarkdown += `## 📱 Social Content Pack\n\n`;
      socials.forEach((soc) => {
        masterMarkdown += `### ${soc.title}\n\n`;
        if (typeof soc.content === 'object' && soc.content.linkedin) {
          masterMarkdown += `#### LinkedIn Post\n${soc.content.linkedin.fullPost || ''}\n\n`;
        }
        if (typeof soc.content === 'object' && soc.content.twitter?.thread) {
          masterMarkdown += `#### X Thread\n${soc.content.twitter.thread.join('\n\n')}\n\n`;
        }
        if (typeof soc.content === 'string') {
          masterMarkdown += `${soc.content}\n\n`;
        }
      });
      masterMarkdown += `---\n\n`;
    }

    if (titles.length > 0) {
      masterMarkdown += `## 💡 Categorized Headlines\n\n`;
      titles.forEach((t) => {
        masterMarkdown += `- ${t.title}\n`;
      });
      masterMarkdown += `\n---\n\n`;
    }

    if (images.length > 0) {
      masterMarkdown += `## 🖼️ Visual Deliverables (FLUX)\n\n`;
      images.forEach((img, idx) => {
        masterMarkdown += `### Visual ${idx + 1}: ${img.title}\n\n`;
        if (img.previewUrl) {
          masterMarkdown += `![${img.title}](${img.previewUrl})\n\n`;
        }
      });
      masterMarkdown += `---\n\n`;
    }

    return {
      filename: `${cleanSlug}-complete-package`,
      jsonBundle,
      masterMarkdown,
      summary: {
        projectName,
        totalAssets: assets.length,
        hasBrief: !!brief,
        hasBrandKit: !!brandKit,
      },
    };
  }
}

module.exports = new ExportService();
