import type { Skill } from '@/types';

const proficiencyStyle: Record<string, string> = {
  beginner:     'bg-gray-50 text-gray-700 ring-gray-200',
  intermediate: 'bg-sky-50 text-sky-700 ring-sky-200',
  advanced:     'bg-emerald-50 text-emerald-700 ring-emerald-200',
  expert:       'bg-brand-50 text-brand-700 ring-brand-200',
};

const categoryLabel: Record<string, string> = {
  programming_language: 'Languages',
  framework:            'Frameworks',
  database:             'Databases',
  cloud:                'Cloud',
  devops:               'DevOps',
  soft_skill:           'Soft skills',
  tool:                 'Tools',
  methodology:          'Methodologies',
  other:                'Other',
};

export function SkillsByCategory({ skills }: { skills: Skill[] }) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  if (!categories.length) {
    return <p className="text-sm text-gray-500">No skills extracted.</p>;
  }

  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat}>
          <h4 className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
            {categoryLabel[cat] ?? cat.replace(/_/g, ' ')}
            <span className="ml-2 text-gray-400 font-normal normal-case">
              {grouped[cat].length}
            </span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {grouped[cat].map((s) => (
              <span
                key={s.name}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset transition hover:-translate-y-0.5 ${
                  proficiencyStyle[s.proficiency] || proficiencyStyle.beginner
                }`}
                title={`${s.proficiency}${s.yearsOfExperience ? ` · ${s.yearsOfExperience}y` : ''}`}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
