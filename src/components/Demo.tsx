import * as React from 'react';

import copy from '../assets/copy.svg'
import linkIcon from '../assets/link.svg'
import loader from '../assets/loader.svg'
import tick from '../assets/tick.svg'

import { useLazyGetSummaryQuery } from '../services/article';

type Article = {
  url: string;
  summary: string;
}

const Demo = () => {

  const [article, setArticle] = React.useState({url: '', summary: ''});
  const [allArticles, setAllArticles] = React.useState<Article[]>([]);
  const [copied, setCopied] = React.useState("");
   
  React.useEffect(() => {
    const articlesFromLocalStorag = JSON.parse(localStorage.getItem('articles') as string);
    if(articlesFromLocalStorag) setAllArticles(articlesFromLocalStorag);
  }, [])

  const [ getSummary, {error, isFetching } ] = useLazyGetSummaryQuery();

  const handleSubmit = async (e:  React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data } = await getSummary({articleUrl: article.url});

    if(data?.summary) {
      const newArticle = { ...article, summary: data.summary}
      const updatedAllAerticles = [ newArticle, ...allArticles ];

      setArticle(newArticle);
      setAllArticles(updatedAllAerticles);

      localStorage.setItem('articles', JSON.stringify(updatedAllAerticles));

      console.log('newArticle : ', newArticle);
      
    }
  };

  const serErrorHandle = (error: any) => {
    if(error && 'data' in error) {
      const data= error?.data as { error: string };
      if('error' in data ) return data?.error;
    }
  }

  const handleCopy = (copyUrl: string) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(''), 3000);
  };

  return (
    <section className='mt-16 w-full max-w-xl'>
      <div className='flex flex-col w-full gap-2'>
        <form className='relative flex justify-center items-center' onSubmit={handleSubmit}>
          <img src={linkIcon} alt='link_icon' className='absolute left-0 my-2 ml-3 w-5' />
          <input type='url' placeholder='Enter a URl' onChange={(e) => setArticle((pre) => ({ ...pre, url: e.target.value}))} value={article.url} required className='url_input peer' />
          <button type='submit' className='submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700'>↵</button>
        </form>

      {/* Browse URl History  */}
      <div className='flex flex-col gap-1 max-h-60 overflow-y-auto'>
          {allArticles.reverse().map((item, index) => (
            <div
              key={`link-${index}`}
              onClick={() => setArticle(item)}
              className='link_card'
            >
              <div className='copy_btn' onClick={() => handleCopy(item.url)}>
                <img
                  src={copied === item.url ? tick : copy}
                  alt={copied === item.url ? "tick_icon" : "copy_icon"}
                  className='w-[40%] h-[40%] object-contain'
                />
              </div>
              <p className='flex-1 font-satoshi text-blue-700 font-medium text-sm truncate'>
                {item.url}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Display results  */}
      <div className='my-10 max-w-full flex justify-center items-center'>
        {isFetching ? (
          <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
        ) : error ? (
          <p className='font-inter font-bold text-black text-center'>
            Well, that wasn't supposed to happen...
            <br />
            <span className='font-satoshi font-normal text-gray-700'>
              {serErrorHandle(error)}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className='flex flex-col gap-3'>
              <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                Article <span className='blue_gradient'>Summary</span>
              </h2>
              <div className='summary_box'>
                <p className='font-inter font-medium text-sm text-gray-700'>
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  )
}

export default Demo