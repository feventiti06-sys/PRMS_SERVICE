package com.erp.prms.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String PROCUREMENT_EXCHANGE = "procurement.exchange";
    public static final String PROCUREMENT_QUEUE = "procurement.queue";
    public static final String PROCUREMENT_ROUTING_KEY = "procurement.event";

    @Bean
    public Queue procurementQueue() {
        return new Queue(PROCUREMENT_QUEUE, true); // durable
    }

    @Bean
    public TopicExchange procurementExchange() {
        return new TopicExchange(PROCUREMENT_EXCHANGE);
    }

    @Bean
    public Binding binding(Queue procurementQueue, TopicExchange procurementExchange) {
        return BindingBuilder.bind(procurementQueue)
                .to(procurementExchange)
                .with(PROCUREMENT_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }
}