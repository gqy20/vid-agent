import gh01 from '../../../../../github-course/episodes/gh01-git-vs-github.json';

export const GH01 = gh01;

export type GitHubCourseEpisode = typeof GH01;
export type GitHubCourseScene = GitHubCourseEpisode['scenes'][number];
