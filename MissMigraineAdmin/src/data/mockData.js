const firstNames = [
  'Emma',
  'Olivia',
  'Sophia',
  'Isabella',
  'Mia',
  'Charlotte',
  'Amelia',
  'Harper',
  'Evelyn',
  'Abigail',
  'James',
  'Michael',
  'Robert',
  'David',
  'William',
  'Richard',
  'Joseph',
  'Thomas',
  'Sarah',
  'Jennifer',
  'Lisa',
  'Maria',
  'Anna',
  'Kate',
];

const lastNames = [
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Wilson',
  'Anderson',
  'Taylor',
  'Thomas',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Thompson',
  'White',
  'Harris',
];

function randomDate(daysAgoMax) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgoMax));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d.toISOString();
}

function buildUsers() {
  const roles = ['user', 'user', 'user', 'trusted_person', 'admin'];
  const statuses = ['active', 'active', 'active', 'inactive', 'suspended'];
  const users = [
    {
      id: 'admin-001',
      full_name: 'System Admin',
      email: 'admin@missmigraine.com',
      role: 'admin',
      status: 'active',
      is_active: true,
      created_at: '2024-01-15T10:00:00.000Z',
    },
  ];

  for (let i = 0; i < 24; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const role = roles[i % roles.length];
    const status = statuses[i % statuses.length];
    users.push({
      id: `user-${String(i + 1).padStart(3, '0')}`,
      full_name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      role,
      status,
      is_active: status === 'active',
      created_at: randomDate(400),
    });
  }
  return users;
}

const ACTIONS = [
  'Login',
  'Logout',
  'Delete User',
  'Disable User',
  'Enable User',
  'Edit Content',
  'Publish Content',
  'Unpublish Content',
  'Update Settings',
  'Export Logs',
  'Create User',
  'Edit User',
];

function buildLogs(users) {
  const admins = users.filter((u) => u.role === 'admin');
  const nonAdmins = users.filter((u) => u.role !== 'admin');
  const admin = admins[0] || users[0];
  const logs = [];

  for (let i = 0; i < 55; i++) {
    const action = ACTIONS[i % ACTIONS.length];
    const target = nonAdmins[i % nonAdmins.length];
    const ok = i % 7 !== 0;
    logs.push({
      id: `log-${String(i + 1).padStart(4, '0')}`,
      created_at: randomDate(60),
      admin_id: admin.id,
      admin_name: admin.full_name,
      action,
      target_user_id: target?.id ?? null,
      target_user_name: target?.full_name ?? '—',
      details: {
        ip: `192.168.${(i % 255) + 1}.${(i * 3) % 255}`,
        userAgent: 'MissMigraine Admin Panel',
        note: `Action ${action} performed successfully`,
      },
      status: ok ? 'success' : 'failed',
    });
  }
  return logs.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
}

function buildContent() {
  return [
    {
      id: 'content-001',
      title: 'Understanding Cycle-Related Migraine',
      category: 'cycle_migraine',
      body: 'Learn how hormonal cycles can trigger migraine patterns and what you can track.',
      featured_image_url: '',
      is_published: true,
      created_at: '2025-11-01T09:00:00.000Z',
    },
    {
      id: 'content-002',
      title: 'Common Food Triggers to Watch',
      category: 'triggers',
      body: 'A practical guide to identifying dietary triggers without restrictive dieting.',
      featured_image_url: '',
      is_published: true,
      created_at: '2025-10-20T14:30:00.000Z',
    },
    {
      id: 'content-003',
      title: 'Acute Treatment Options',
      category: 'treatment',
      body: 'Overview of rescue medications and non-pharmacological approaches.',
      featured_image_url: '',
      is_published: false,
      created_at: '2025-09-15T11:00:00.000Z',
    },
    {
      id: 'content-004',
      title: 'Sleep Hygiene for Migraine Prevention',
      category: 'general',
      body: 'How consistent sleep schedules support fewer migraine days.',
      featured_image_url: '',
      is_published: true,
      created_at: '2025-08-05T16:45:00.000Z',
    },
    {
      id: 'content-005',
      title: 'Tracking Your Menstrual Cycle',
      category: 'cycle_migraine',
      body: 'Step-by-step logging tips to correlate cycle phase with symptoms.',
      featured_image_url: '',
      is_published: true,
      created_at: '2025-07-22T08:15:00.000Z',
    },
    {
      id: 'content-006',
      title: 'Stress and Migraine: Breaking the Loop',
      category: 'triggers',
      body: 'Mind-body techniques that complement medical care.',
      featured_image_url: '',
      is_published: false,
      created_at: '2025-06-10T13:00:00.000Z',
    },
    {
      id: 'content-007',
      title: 'When to Seek Emergency Care',
      category: 'general',
      body: 'Red-flag symptoms that require immediate medical attention.',
      featured_image_url: '',
      is_published: true,
      created_at: '2025-05-18T10:30:00.000Z',
    },
    {
      id: 'content-008',
      title: 'Preventive Therapy Basics',
      category: 'treatment',
      body: 'Introduction to daily preventives and how they differ from acute treatment.',
      featured_image_url: '',
      is_published: true,
      created_at: '2025-04-02T12:00:00.000Z',
    },
  ];
}

export const defaultSettings = {
  default_log_reminder_time: '20:00',
  default_cycle_reminder_days_before: 2,
  emergency_alert_threshold: 7,
  otp_expiry_minutes: 60,
  data_retention_days: 365,
  max_quick_logs_per_day: 5,
  max_offline_logs: 50,
  allow_data_export: true,
  allow_account_deletion: true,
  app_maintenance_mode: false,
  min_android_version: '10',
  insight_generation_frequency: 'weekly',
};

export function createMockStore() {
  const users = buildUsers();
  return {
    users,
    logs: buildLogs(users),
    content: buildContent(),
    settings: { ...defaultSettings },
    apiStats: {
      callsToday: 45,
      callsThisMonth: 1280,
      rateLimitStatus: 'healthy',
      dailyCalls: [32, 41, 38, 45, 52, 48, 45],
    },
  };
}

export const MOCK_ADMIN = {
  email: 'admin@missmigraine.com',
  password: 'admin123',
  profile: {
    id: 'admin-001',
    full_name: 'System Admin',
    email: 'admin@missmigraine.com',
    role: 'admin',
  },
};
