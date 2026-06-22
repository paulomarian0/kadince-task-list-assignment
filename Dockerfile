FROM ruby:3.3.11

RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    libvips \
    postgresql-client \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/api

COPY api/Gemfile api/Gemfile.lock ./
RUN bundle install

COPY api/ ./

EXPOSE 3000

ENTRYPOINT ["bin/docker-dev-entrypoint"]
CMD ["bin/rails", "server", "-b", "0.0.0.0", "-p", "3000"]
