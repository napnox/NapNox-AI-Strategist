
import type { GscPagePerformance } from './types';

export const mockGscData: GscPagePerformance[] = [
    {
        url: 'https://example.com/blog/beginner-container-gardening',
        impressions: 85200,
        clicks: 1022,
        ctr: 0.012,
        position: 18.5,
        clicksChange: -45.8,
        positionChange: 4.2,
        topQuery: 'container gardening for beginners',
        queries: [
            { query: 'container gardening for beginners', clicks: 250, impressions: 15000, position: 15.1 },
            { query: 'what to grow in pots on balcony', clicks: 150, impressions: 12000, position: 17.3 },
            { query: 'small space gardening ideas', clicks: 100, impressions: 8000, position: 22.0 },
        ]
    },
    {
        url: 'https://example.com/guides/best-soil-for-balconies',
        impressions: 155000,
        clicks: 1860,
        ctr: 0.012,
        position: 4.8,
        clicksChange: 5.2,
        positionChange: -0.3,
        topQuery: 'best soil for balcony garden',
        queries: [
            { query: 'best soil for balcony garden', clicks: 800, impressions: 50000, position: 4.5 },
            { query: 'lightweight potting mix for containers', clicks: 400, impressions: 35000, position: 5.1 },
            { query: 'can i use garden soil in pots', clicks: 150, impressions: 20000, position: 6.2 },
        ]
    },
    {
        url: 'https://example.com/blog/diy-vertical-herb-garden',
        impressions: 1200,
        clicks: 360,
        ctr: 0.30,
        position: 2.1,
        clicksChange: 25.5,
        positionChange: -1.1,
        topQuery: 'diy vertical herb garden',
        queries: [
            { query: 'diy vertical herb garden', clicks: 200, impressions: 600, position: 2.0 },
            { query: 'how to build a wall planter', clicks: 100, impressions: 400, position: 2.5 },
        ]
    },
    {
        url: 'https://example.com/reviews/top-5-watering-cans-2023',
        impressions: 45000,
        clicks: 2250,
        ctr: 0.05,
        position: 8.9,
        clicksChange: -60.1,
        positionChange: 6.8,
        topQuery: 'best watering can for indoor plants',
        queries: [
            { query: 'best watering can for indoor plants', clicks: 800, impressions: 20000, position: 7.5 },
            { query: 'long spout watering can review', clicks: 500, impressions: 15000, position: 9.2 },
            { query: '2023 watering can comparison', clicks: 100, impressions: 5000, position: 15.0 },
        ]
    },
];
