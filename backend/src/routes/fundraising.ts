import { Router, Request, Response } from 'express';
import { store } from '../services/store';

const router = Router();

const normalizeCampaignFunding = (campaign: any) => {
  if (!campaign) return campaign;
  const rawTarget = Number(campaign.rawTarget ?? 0);
  const rawRaised = Number(campaign.rawRaised ?? 0);
  const percentage = Number.isFinite(campaign.percentage) ? campaign.percentage : rawTarget > 0 ? Math.min(100, Math.round((rawRaised / rawTarget) * 100)) : 0;
  return { ...campaign, rawTarget, rawRaised, percentage };
};

// Get Fundraising Campaigns
router.get(['/', '/campaigns'], (_req: Request, res: Response) => {
  return res.json({ campaigns: store.db.fundraisingCampaigns.map(normalizeCampaignFunding) });
});

// Create Fundraising Campaign
router.post(['/', '/campaigns'], (req: Request, res: Response) => {
  const { title, target, category, endDate, description } = req.body;

  if (!title || !target) {
    return res.status(400).json({ error: 'Title and target amount are required.' });
  }

  const rawTarget = parseFloat(String(target).replace(/[^0-9.]/g, '')) || 1000;

  const newCampaign = {
    id: `fnd-${Date.now()}`,
    title,
    target: `$${rawTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    raised: '$0.00',
    rawTarget,
    rawRaised: 0,
    percentage: 0,
    status: 'Active',
    category: category || 'General',
    endDate: endDate || '2026-12-31',
    description: description || '',
    donorsCount: 0,
  };

  store.db.fundraisingCampaigns.unshift(newCampaign);
  store.commit();

  return res.status(201).json({ campaign: normalizeCampaignFunding(newCampaign), message: 'Fundraising campaign created.' });
});

router.put(['/:id', '/campaigns/:id'], (req: Request, res: Response) => {
  const { id } = req.params;
  const campaign = store.db.fundraisingCampaigns.find((entry) => entry.id === id);

  if (!campaign) {
    return res.status(404).json({ error: 'Fundraising campaign not found.' });
  }

  const { title, target, status, category, endDate, description } = req.body ?? {};

  if (title) campaign.title = title;
  if (status) campaign.status = status;
  if (category) campaign.category = category;
  if (endDate) campaign.endDate = endDate;
  if (description !== undefined) campaign.description = description;
  if (target !== undefined && target !== null && target !== '') {
    const rawTarget = parseFloat(String(target).replace(/[^0-9.]/g, '')) || campaign.rawTarget;
    campaign.rawTarget = rawTarget;
    campaign.target = `$${rawTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  if (campaign.rawTarget > 0) {
    campaign.percentage = Math.min(100, Math.round((campaign.rawRaised / campaign.rawTarget) * 100));
  } else {
    campaign.percentage = 0;
  }

  store.commit();
  return res.json({ campaign: normalizeCampaignFunding(campaign), message: 'Fundraising campaign updated.' });
});

export { router as fundraisingRouter };
