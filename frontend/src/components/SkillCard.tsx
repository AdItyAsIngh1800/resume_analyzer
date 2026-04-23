import type { Skill } from '@/types';

const proficiencyColor: Record<string, string> = {
  beginner: 'bg-gray-200 text-gray-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-green-100 text-green-700',
  expert: 'bg-purple-100 text-purple-700',
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
    <div className="space-y-4">
      {categories.map((cat) => (
        <div key={cat}>
          <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">{cat}</h4>
          <div className="flex flex-wrap gap-2">
            {grouped[cat].map((s) => (
              <span
                key={s.name}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  proficiencyColor[s.proficiency] || 'bg-gray-100 text-gray-700'
                }`}
                title={`${s.proficiency}`}
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
