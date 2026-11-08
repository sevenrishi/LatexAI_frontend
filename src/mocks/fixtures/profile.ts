import type { FullProfile } from '@/types/profile'

export const mockProfile: FullProfile = {
  id: 'usr_mock_123',
  email: 'alex.morgan@example.com',
  fullName: 'Alex Morgan',
  headline: 'Senior Full Stack Engineer & Distributed Systems Lead',
  phone: '+1 (555) 019-2834',
  location: 'San Francisco, CA',
  summary:
    'Results-driven software engineer with 7+ years of experience architecting high-throughput distributed systems and responsive React web applications.',
  website: 'https://alexmorgan.dev',
  github: 'https://github.com/alexmorgan',
  linkedin: 'https://linkedin.com/in/alexmorgan',
  customLinks: [
    { id: 'link_1', label: 'Engineering Blog', url: 'https://alexmorgan.dev/blog' },
  ],
  completeness: {
    percentage: 85,
    tier: 'strong',
    sections: {
      contact: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: false,
    },
    missingSections: ['Certifications'],
  },
  skills: [
    { id: 'sk_1', name: 'TypeScript', category: 'Languages' },
    { id: 'sk_2', name: 'React', category: 'Frontend' },
    { id: 'sk_3', name: 'Node.js', category: 'Backend' },
    { id: 'sk_4', name: 'PostgreSQL', category: 'Databases' },
    { id: 'sk_5', name: 'Docker', category: 'DevOps' },
    { id: 'sk_6', name: 'LaTeX', category: 'Tools' },
  ],
  experience: [
    {
      id: 'exp_1',
      company: 'TechCorp Solutions',
      title: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: null,
      current: true,
      bullets: [
        { id: 'b_1', text: 'Architected event-driven microservices handling 50M+ requests/day with 99.99% uptime.' },
        { id: 'b_2', text: 'Mentored 6 junior engineers and led migration from monolith to modular services.' },
      ],
    },
  ],
  education: [
    {
      id: 'edu_1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2015-08',
      endDate: '2019-05',
      gpa: '3.85',
      honors: 'Summa Cum Laude, Dean’s Honors',
    },
  ],
  certifications: [],
  projects: [
    {
      id: 'proj_1',
      title: 'Distributed Task Queue (Go & Redis)',
      role: 'Creator & Maintainer',
      description: 'Open-source distributed background job processor with automated retries and dead-letter queues.',
      techStack: ['Go', 'Redis', 'Docker'],
      liveUrl: 'https://github.com/alexmorgan/task-queue',
      repoUrl: 'https://github.com/alexmorgan/task-queue',
    },
  ],
}
