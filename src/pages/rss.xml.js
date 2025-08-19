import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const blog = (await getCollection('event')).sort((a, b) => {
        return new Date(b.data.start) - new Date(a.data.start);
    });

  return rss({
    title: 'Calendados',
    description: 'Calendario de eventos de rol y juegos de mesa en España',
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.start,
      description: post.data.description,
      link: `/evento/${post.id}/`,
    })),
    customData: `<language>es</language>`,
  });
}