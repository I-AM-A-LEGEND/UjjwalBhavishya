import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.myscheme.gov.in';

interface Scheme {
  title: string;
  description: string;
  eligibility: string;
  benefits: string;
  url: string;
}

async function getSchemeDetails(schemeUrl: string): Promise<Scheme> {
  try {
    const { data } = await axios.get(schemeUrl);
    const $ = cheerio.load(data);

    const title = $('h1').text().trim();
    const description = $('.scheme-description').text().trim(); // This is a placeholder selector
    const eligibility = $('.eligibility-criteria').text().trim(); // This is a placeholder selector
    const benefits = $('.scheme-benefits').text().trim(); // This is a placeholder selector

    return { title, description, eligibility, benefits, url: schemeUrl };
  } catch (error) {
    console.error(`Error fetching scheme details from ${schemeUrl}:`, error);
    throw error;
  }
}

export async function scrapeSchemes(): Promise<Scheme[]> {
  try {
    const { data } = await axios.get(`${BASE_URL}/search`);
    const $ = cheerio.load(data);

    const schemePromises: Promise<Scheme>[] = [];
    $('.scheme-card').each((_i, el) => { // This is a placeholder selector
      const schemeUrl = $(el).find('a').attr('href');
      if (schemeUrl) {
        schemePromises.push(getSchemeDetails(`${BASE_URL}${schemeUrl}`));
      }
    });

    const schemes = await Promise.all(schemePromises);
    return schemes;
  } catch (error) {
    console.error('Error scraping schemes:', error);
    throw error;
  }
}
