const express = require('express');
const router = express.Router();
const { Prompt, PromptGroup } = require('~/models/Prompt');
const { getProjectByName } = require('~/models/Project');
const { Constants } = require('librechat-data-provider');

// Simple auth middleware - replace with better auth in production
const simpleAuth = (req, res, next) => {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// GET all shared prompts
router.get('/shared-prompts', simpleAuth, async (req, res) => {
  try {
    const project = await getProjectByName(Constants.GLOBAL_PROJECT_NAME, 'promptGroupIds');
    if (!project?.promptGroupIds?.length) {
      return res.json({ sharedPrompts: [] });
    }

    const sharedGroups = await PromptGroup.find({ 
      _id: { $in: project.promptGroupIds } 
    }).populate('productionId');

    res.json({ sharedPrompts: sharedGroups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Add prompt to shared
router.post('/share-prompt', simpleAuth, async (req, res) => {
  try {
    const { promptGroupId } = req.body;
    
    const project = await getProjectByName(Constants.GLOBAL_PROJECT_NAME);
    if (!project) {
      return res.status(404).json({ error: 'Global project not found' });
    }

    await project.updateOne({
      $addToSet: { promptGroupIds: promptGroupId }
    });

    res.json({ success: true, message: 'Prompt added to shared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Remove prompt from shared
router.delete('/share-prompt/:groupId', simpleAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const project = await getProjectByName(Constants.GLOBAL_PROJECT_NAME);
    if (!project) {
      return res.status(404).json({ error: 'Global project not found' });
    }

    await project.updateOne({
      $pull: { promptGroupIds: groupId }
    });

    res.json({ success: true, message: 'Prompt removed from shared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Bulk create shared prompts
router.post('/bulk-create-shared', simpleAuth, async (req, res) => {
  try {
    const { prompts } = req.body; // Array of { name, prompt, category, oneliner }
    
    const results = [];
    
    for (const promptData of prompts) {
      // Create prompt group
      const group = new PromptGroup({
        name: promptData.name,
        category: promptData.category || 'General',
        oneliner: promptData.oneliner || '',
        author: null, // System created
        authorName: 'System',
        numberOfGenerations: 1,
      });
      
      await group.save();
      
      // Create prompt
      const prompt = new Prompt({
        groupId: group._id,
        prompt: promptData.prompt,
        type: 'text',
        author: null,
      });
      
      await prompt.save();
      
      // Set as production
      group.productionId = prompt._id;
      await group.save();
      
      // Add to shared
      const project = await getProjectByName(Constants.GLOBAL_PROJECT_NAME);
      await project.updateOne({
        $addToSet: { promptGroupIds: group._id }
      });
      
      results.push({ name: promptData.name, groupId: group._id });
    }
    
    res.json({ success: true, created: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;